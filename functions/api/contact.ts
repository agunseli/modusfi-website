interface Env {
  CONTACT_FORM_ENABLED?: string;
  CONTACT_ALLOWED_ORIGIN?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
  POSTMARK_SERVER_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
}

const maxBodyBytes = 32_768;
const emailPattern = /^[^\s@<>\x00-\x1f\x7f]+@[^\s@<>\x00-\x1f\x7f]+\.[^\s@<>\x00-\x1f\x7f]+$/;

function reply(status: number, success = false): Response {
  return Response.json(
    { success },
    {
      status,
      headers: { 'Cache-Control': 'no-store', ...(status === 405 ? { Allow: 'POST' } : {}) },
    },
  );
}

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBodyBytes) {
      await reader.cancel();
      throw new Error('Body too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function onRequest({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  if (request.method !== 'POST') return reply(405);
  if (
    env.CONTACT_FORM_ENABLED !== 'true' ||
    !env.CONTACT_ALLOWED_ORIGIN ||
    !env.CONTACT_FROM_EMAIL ||
    !env.CONTACT_TO_EMAIL ||
    !env.POSTMARK_SERVER_TOKEN ||
    !env.TURNSTILE_SECRET_KEY ||
    !emailPattern.test(env.CONTACT_FROM_EMAIL) ||
    !emailPattern.test(env.CONTACT_TO_EMAIL)
  ) {
    return reply(503);
  }

  let origin: URL;
  try {
    origin = new URL(env.CONTACT_ALLOWED_ORIGIN);
    if (origin.origin !== env.CONTACT_ALLOWED_ORIGIN) return reply(503);
  } catch {
    return reply(503);
  }
  if (
    request.headers.get('Origin') !== origin.origin ||
    new URL(request.url).origin !== origin.origin
  ) {
    return reply(403);
  }
  if (
    request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
  ) {
    return reply(415);
  }
  if (Number(request.headers.get('Content-Length')) > maxBodyBytes) return reply(413);

  let body: Record<string, unknown>;
  try {
    const parsed = await readBody(request);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return reply(400);
    body = parsed as Record<string, unknown>;
  } catch {
    return reply(400);
  }
  if (
    typeof body.name !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.message !== 'string' ||
    typeof body.website !== 'string' ||
    typeof body.turnstileToken !== 'string'
  )
    return reply(400);

  const name = body.name.trim();
  const email = body.email.trim();
  const message = body.message.trim();
  if (
    !name ||
    name.length > 100 ||
    /[\x00-\x1f\x7f]/.test(name) ||
    email.length > 254 ||
    !emailPattern.test(email) ||
    !message ||
    message.length > 5000 ||
    message.includes('\0') ||
    body.website !== '' ||
    !body.turnstileToken ||
    body.turnstileToken.length > 2048
  )
    return reply(400);

  try {
    const verificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: body.turnstileToken,
        }),
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!verificationResponse.ok) return reply(503);
    const verification = (await verificationResponse.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
    };
    if (
      verification.success !== true ||
      verification.hostname !== origin.hostname ||
      verification.action !== 'contact'
    ) {
      return reply(403);
    }

    const deliveryResponse = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Postmark-Server-Token': env.POSTMARK_SERVER_TOKEN,
      },
      body: JSON.stringify({
        From: `ModusFi Enquiries <${env.CONTACT_FROM_EMAIL}>`,
        To: env.CONTACT_TO_EMAIL,
        ReplyTo: email,
        Subject: 'New ModusFi website enquiry',
        TextBody: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        MessageStream: 'outbound',
        TrackOpens: false,
        TrackLinks: 'None',
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const result: unknown = await deliveryResponse.json().catch(() => null);
    const delivery =
      result && typeof result === 'object' ? (result as Record<string, unknown>) : null;
    if (
      !deliveryResponse.ok ||
      delivery?.ErrorCode !== 0 ||
      typeof delivery?.MessageID !== 'string' ||
      !delivery.MessageID
    ) {
      // Provider messages can contain addresses. Log only fixed labels and numeric codes.
      console.error('contact_delivery_failed', {
        provider: 'postmark',
        httpStatus: deliveryResponse.status,
        errorCode:
          typeof delivery?.ErrorCode === 'number' && Number.isSafeInteger(delivery.ErrorCode)
            ? delivery.ErrorCode
            : null,
      });
      return reply(deliveryResponse.ok && !delivery ? 504 : 502);
    }
    return reply(200, true);
  } catch {
    // Never log submissions, tokens, or provider exceptions containing personal data.
    return reply(504);
  }
}
