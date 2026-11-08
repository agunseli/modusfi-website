interface Turnstile {
  render(container: string, options: Record<string, unknown>): string;
  reset(widget: string): void;
}

const form = document.querySelector<HTMLFormElement>('#contact-form');

if (form) {
  const fields = form.querySelector('fieldset')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const status = form.querySelector<HTMLElement>('#contact-status')!;
  let sending = false;
  let token = '';
  let widget: string | undefined;
  let turnstile: Turnstile | undefined;

  const announce = (message: string, focus = false) => {
    status.textContent = message;
    if (focus) status.focus();
  };

  // Always prevent native submission, including when configuration is incomplete.
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || form.dataset.enabled !== 'true') return;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    if (!String(data.get('name') ?? '').trim() || !String(data.get('message') ?? '').trim()) {
      announce('Please enter your name and a message.', true);
      return;
    }
    if (!token) {
      announce('Please complete the security check before sending your enquiry.', true);
      return;
    }

    sending = true;
    button.disabled = true;
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    button.textContent = 'Sending…';
    announce('Sending your enquiry…');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          name: String(data.get('name') ?? '').trim(),
          email: String(data.get('email') ?? '').trim(),
          message: String(data.get('message') ?? '').trim(),
          website: String(data.get('website') ?? ''),
          turnstileToken: token,
        }),
      });

      if (response.status === 504) {
        throw new Error('Delivery could not be confirmed');
      } else if (response.status === 429) {
        announce('Too many attempts. Please wait a few minutes before trying again.', true);
      } else if (!response.ok) {
        announce(
          'We could not send your enquiry. Your message is still here; please try again later.',
          true,
        );
      } else {
        const result: unknown = await response.json();
        if (
          !result ||
          typeof result !== 'object' ||
          !('success' in result) ||
          result.success !== true
        ) {
          throw new Error('Unexpected contact response');
        }
        form.reset();
        announce('Thank you. Your enquiry has been sent. We will be in touch.', true);
      }
    } catch {
      // A timeout can occur after acceptance. Never automatically retry an enquiry.
      announce(
        'We could not confirm whether your enquiry was sent. Your message is still here. Please wait before trying again.',
        true,
      );
    } finally {
      sending = false;
      token = '';
      fields.disabled = false;
      button.disabled = true;
      button.textContent = 'Send enquiry →';
      form.removeAttribute('aria-busy');
      if (widget !== undefined) turnstile?.reset(widget);
    }
  });

  if (form.dataset.enabled === 'true' && form.dataset.sitekey) {
    fields.disabled = false;
    announce('Loading the security check…');
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const unavailable = () => {
      token = '';
      button.disabled = true;
      announce('The security check is unavailable. Please refresh the page to try again.');
    };
    script.addEventListener('error', unavailable);
    script.addEventListener('load', () => {
      turnstile = (window as Window & { turnstile?: Turnstile }).turnstile;
      if (!turnstile) return unavailable();
      try {
        widget = turnstile.render('#contact-verification', {
          sitekey: form.dataset.sitekey,
          action: 'contact',
          theme: 'light',
          size: 'compact',
          callback: (value: string) => {
            token = value;
            button.disabled = sending;
            if (
              !sending &&
              (status.textContent === 'Loading the security check…' ||
                status.textContent === 'The security check expired. Please complete it again.')
            )
              announce('');
          },
          'expired-callback': () => {
            token = '';
            button.disabled = true;
            announce('The security check expired. Please complete it again.');
          },
          'error-callback': unavailable,
          'timeout-callback': unavailable,
          'unsupported-callback': unavailable,
        });
      } catch {
        unavailable();
      }
    });
    document.head.append(script);
  }
}
