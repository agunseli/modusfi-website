import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(
  readFileSync(new URL('../functions/api/contact.ts', import.meta.url), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } },
).outputText;

function setup({ verification, delivery, failNetwork = false } = {}) {
  const calls = [];
  const logs = [];
  const context = {
    exports: {},
    Response,
    URL,
    URLSearchParams,
    AbortSignal,
    Uint8Array,
    TextDecoder,
    console: { error: (...args) => logs.push(args) },
    fetch: async (url, options) => {
      calls.push({ url, options });
      if (failNetwork) throw new TypeError('Network error containing private provider details');
      return url.includes('siteverify')
        ? (verification ??
            Response.json({ success: true, hostname: 'modusfi.io', action: 'contact' }))
        : (delivery ?? Response.json({ ErrorCode: 0, MessageID: 'test-message' }));
    },
  };
  vm.runInNewContext(source, context);
  const env = {
    CONTACT_FORM_ENABLED: 'true',
    CONTACT_ALLOWED_ORIGIN: 'https://modusfi.io',
    CONTACT_FROM_EMAIL: 'website@modusfi.io',
    CONTACT_TO_EMAIL: 'recipient@example.com',
    POSTMARK_SERVER_TOKEN: 'mock-token',
    TURNSTILE_SECRET_KEY: 'mock-secret',
  };
  const payload = {
    name: ' Example ',
    email: 'visitor@example.com',
    message: ' Project ',
    website: '',
    turnstileToken: 'test-token',
  };
  return {
    calls,
    logs,
    env,
    payload,
    send: (
      body = payload,
      { method = 'POST', origin = 'https://modusfi.io', type = 'application/json', raw } = {},
    ) =>
      context.exports.onRequest({
        env,
        request: new Request('https://modusfi.io/api/contact', {
          method,
          headers: { Origin: origin, 'Content-Type': type },
          ...(method === 'POST' ? { body: raw ?? JSON.stringify(body) } : {}),
        }),
      }),
  };
}

test('only verified requests send a fixed-recipient plain-text email', async () => {
  const app = setup();
  const response = await app.send();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(app.calls.length, 2);
  const mail = JSON.parse(app.calls[1].options.body);
  assert.equal(mail.To, 'recipient@example.com');
  assert.equal(mail.From, 'website@modusfi.io');
  assert.equal(mail.ReplyTo, 'visitor@example.com');
  assert.match(mail.TextBody, /Name: Example\nEmail: visitor@example.com\n\nProject/);
  assert.equal(mail.TrackOpens, false);
  assert.equal(mail.TrackLinks, 'None');
  assert.equal(mail.HtmlBody, undefined);
});

test('disabled or incomplete configuration fails closed without external calls', async () => {
  for (const key of [
    'CONTACT_FORM_ENABLED',
    'CONTACT_ALLOWED_ORIGIN',
    'CONTACT_FROM_EMAIL',
    'CONTACT_TO_EMAIL',
    'POSTMARK_SERVER_TOKEN',
    'TURNSTILE_SECRET_KEY',
  ]) {
    const app = setup();
    delete app.env[key];
    assert.equal((await app.send()).status, 503);
    assert.equal(app.calls.length, 0);
  }
});

test('method, origin, content type, malformed JSON and oversized bodies are rejected', async () => {
  const app = setup();
  assert.equal((await app.send(undefined, { method: 'GET' })).status, 405);
  assert.equal((await app.send(undefined, { origin: 'https://other.example' })).status, 403);
  assert.equal((await app.send(undefined, { type: 'text/plain' })).status, 415);
  assert.equal((await app.send(undefined, { raw: '{' })).status, 400);
  assert.equal((await app.send(undefined, { raw: 'x'.repeat(40_000) })).status, 400);
  assert.equal(app.calls.length, 0);
});

test('untrusted fields cannot bypass validation, inject headers or trigger email', async () => {
  for (const change of [
    { name: '' },
    { name: 'x'.repeat(101) },
    { name: 'Name\r\nBcc: other@example.com' },
    { email: 'invalid' },
    { email: 'visitor@example.com\r\nBcc: other@example.com' },
    { message: ' ' },
    { message: 'x'.repeat(5001) },
    { message: ['unexpected'] },
    { website: 'spam.example' },
    { turnstileToken: '' },
    { turnstileToken: 'x'.repeat(2049) },
  ]) {
    const app = setup();
    assert.equal((await app.send({ ...app.payload, ...change })).status, 400);
    assert.equal(app.calls.length, 0);
  }
});

test('failed, wrong-hostname and wrong-action security tokens never send email', async () => {
  for (const verification of [
    { success: false },
    { success: true, hostname: 'other.example', action: 'contact' },
    { success: true, hostname: 'modusfi.io', action: 'other' },
  ]) {
    const app = setup({ verification: Response.json(verification) });
    assert.equal((await app.send()).status, 403);
    assert.equal(app.calls.length, 1);
  }
});

test('Postmark HTTP and API-level rejection never report success', async () => {
  for (const delivery of [
    new Response('Private provider error', { status: 422 }),
    Response.json({ ErrorCode: 300, Message: 'Private provider detail' }),
    Response.json({ ErrorCode: 0 }),
  ]) {
    const app = setup({ delivery });
    const response = await app.send();
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { success: false });
  }
});

test('network uncertainty exposes no internals and never automatically retries', async () => {
  const app = setup({ failNetwork: true });
  const response = await app.send();
  assert.equal(response.status, 504);
  assert.deepEqual(await response.json(), { success: false });
  assert.equal(app.calls.length, 1);
});

test('delivery diagnostics expose only a fixed label, provider and numeric codes', async () => {
  const app = setup({
    delivery: Response.json(
      {
        ErrorCode: 10,
        Message: 'Private details: recipient@example.com mock-token Project',
      },
      { status: 401 },
    ),
  });
  const response = await app.send();
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { success: false });
  assert.deepEqual(JSON.parse(JSON.stringify(app.logs)), [
    ['contact_delivery_failed', { provider: 'postmark', httpStatus: 401, errorCode: 10 }],
  ]);
});

test('untrusted provider error fields and non-JSON responses cannot leak into logs', async () => {
  for (const delivery of [
    Response.json(
      { ErrorCode: 'private@example.com', Message: 'private message' },
      { status: 422 },
    ),
    new Response('private message and credentials', { status: 502 }),
  ]) {
    const app = setup({ delivery });
    assert.equal((await app.send()).status, 502);
    const logs = JSON.parse(JSON.stringify(app.logs));
    assert.equal(logs[0][1].errorCode, null);
    assert.doesNotMatch(JSON.stringify(logs), /private|credentials/);
  }
});
