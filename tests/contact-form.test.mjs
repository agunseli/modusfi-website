import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(
  readFileSync(new URL('../src/scripts/contact-form.ts', import.meta.url), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;

// Exercise the browser controller with controllable security and network boundaries.
function setup({
  enabled = true,
  verificationWidth = 480,
  fetch = async () => Response.json({ success: true }),
} = {}) {
  const listeners = {};
  const attributes = {};
  const fields = { disabled: true };
  const button = { disabled: true, textContent: 'Send enquiry →' };
  const status = { textContent: '', focus() {} };
  const values = {
    name: ' Example visitor ',
    email: 'visitor@example.com',
    message: ' Project ',
    website: '',
  };
  let valid = true;
  let resets = 0;
  let removedWidgets = 0;
  let resizeCallback;
  const verification = {
    get clientWidth() {
      return verificationWidth;
    },
  };
  let options;
  let script;
  const requests = [];
  const form = {
    action: 'https://modusfi.io/api/contact',
    dataset: { enabled: String(enabled), sitekey: enabled ? 'test-key' : undefined },
    querySelector: (selector) =>
      ({
        fieldset: fields,
        'button[type="submit"]': button,
        '#contact-status': status,
        '#contact-verification': verification,
      })[selector],
    addEventListener: (name, handler) => {
      listeners[name] = handler;
    },
    reportValidity: () => valid,
    setAttribute: (name, value) => {
      attributes[name] = value;
    },
    removeAttribute: (name) => {
      delete attributes[name];
    },
    reset: () => {
      resets++;
      Object.keys(values).forEach((key) => {
        values[key] = '';
      });
    },
  };
  const turnstile = {
    render: (_selector, config) => {
      options = config;
      return 'widget';
    },
    reset: () => {
      options.callback('fresh-token');
    },
    remove: () => {
      removedWidgets++;
    },
  };
  vm.runInNewContext(source, {
    document: {
      querySelector: () => form,
      createElement: () => {
        const events = {};
        script = {
          addEventListener: (name, callback) => {
            events[name] = callback;
          },
          events,
        };
        return script;
      },
      head: { append: () => {} },
    },
    window: { turnstile },
    FormData: class {
      get(key) {
        return values[key];
      }
    },
    AbortSignal,
    ResizeObserver: class {
      constructor(callback) {
        resizeCallback = callback;
      }
      observe() {}
    },
    fetch: async (...args) => {
      requests.push(args);
      return fetch(...args);
    },
  });
  script?.events.load();
  return {
    fields,
    button,
    get widgetSize() {
      return options?.size;
    },
    get removedWidgets() {
      return removedWidgets;
    },
    resize: (width) => {
      verificationWidth = width;
      resizeCallback?.();
    },
    status,
    values,
    requests,
    attributes,
    verify: () => options.callback('test-token'),
    expire: () => options['expired-callback'](),
    failSecurity: () => options['error-callback'](),
    setValid: (value) => {
      valid = value;
    },
    submit: () => listeners.submit({ preventDefault() {} }),
    get resets() {
      return resets;
    },
    get script() {
      return script;
    },
  };
}

test('disabled configuration never loads Turnstile or submits', async () => {
  const page = setup({ enabled: false });
  await page.submit();
  assert.equal(page.script, undefined);
  assert.equal(page.fields.disabled, true);
  assert.equal(page.requests.length, 0);
});

test('invalid fields, whitespace-only input and missing security token never submit', async () => {
  const page = setup();
  await page.submit();
  page.verify();
  page.setValid(false);
  await page.submit();
  page.setValid(true);
  page.values.message = '   ';
  await page.submit();
  assert.equal(page.requests.length, 0);
});

test('success sends the agreed payload, clears fields and preserves confirmation after widget reset', async () => {
  const page = setup();
  page.verify();
  await page.submit();
  const [url, request] = page.requests[0];
  assert.equal(url, 'https://modusfi.io/api/contact');
  assert.deepEqual(JSON.parse(request.body), {
    name: 'Example visitor',
    email: 'visitor@example.com',
    message: 'Project',
    website: '',
    turnstileToken: 'test-token',
  });
  assert.equal(page.resets, 1);
  assert.match(page.status.textContent, /Thank you/);
  assert.equal(page.fields.disabled, false);
  assert.equal(page.attributes['aria-busy'], undefined);
});

test('pending request prevents duplicate submissions and disables editing', async () => {
  let finish;
  const page = setup({
    fetch: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  page.verify();
  const first = page.submit();
  await page.submit();
  assert.equal(page.requests.length, 1);
  assert.equal(page.fields.disabled, true);
  assert.equal(page.button.disabled, true);
  assert.equal(page.attributes['aria-busy'], 'true');
  finish(Response.json({ success: true }));
  await first;
});

for (const [name, response, message] of [
  ['rate limiting', () => new Response('', { status: 429 }), /Too many attempts/],
  ['delivery failure', () => new Response('', { status: 503 }), /could not send/],
  ['uncertain delivery', () => new Response('', { status: 504 }), /could not confirm/],
  ['HTML fallback', () => new Response('<html>Home</html>'), /could not confirm/],
  ['unexpected JSON', () => Response.json({ success: false }), /could not confirm/],
  [
    'network failure',
    () => {
      throw new TypeError('Network failure');
    },
    /could not confirm/,
  ],
  [
    'timeout',
    () => {
      throw new DOMException('Timed out', 'TimeoutError');
    },
    /could not confirm/,
  ],
]) {
  test(`${name} preserves the enquiry and does not automatically retry`, async () => {
    const page = setup({ fetch: response });
    page.verify();
    await page.submit();
    assert.equal(page.resets, 0);
    assert.equal(page.values.message, ' Project ');
    assert.equal(page.fields.disabled, false);
    assert.match(page.status.textContent, message);
    assert.equal(page.requests.length, 1);
  });
}

test('expired and failed verification disable sending', () => {
  const page = setup();
  page.verify();
  page.expire();
  assert.equal(page.button.disabled, true);
  assert.match(page.status.textContent, /expired/);
  page.verify();
  page.failSecurity();
  assert.equal(page.button.disabled, true);
  assert.match(page.status.textContent, /unavailable/);
});

test('verification fits the form width and a size change invalidates the previous token', async () => {
  const page = setup();
  assert.equal(page.widgetSize, 'normal');
  page.verify();
  page.resize(250);
  assert.equal(page.widgetSize, 'compact');
  assert.equal(page.removedWidgets, 1);
  assert.equal(page.button.disabled, true);
  await page.submit();
  assert.equal(page.requests.length, 0);
  page.verify();
  page.resize(280);
  assert.equal(page.removedWidgets, 1);
  assert.equal(page.button.disabled, false);
  page.resize(300);
  assert.equal(page.widgetSize, 'normal');
  assert.equal(page.button.disabled, true);
});

test('narrow forms start compact and resizing during submission waits for completion', async () => {
  let finish;
  const page = setup({
    verificationWidth: 220,
    fetch: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  assert.equal(page.widgetSize, 'compact');
  page.verify();
  const pending = page.submit();
  page.resize(480);
  assert.equal(page.widgetSize, 'compact');
  assert.equal(page.removedWidgets, 0);
  finish(Response.json({ success: true }));
  await pending;
  assert.equal(page.widgetSize, 'normal');
  assert.equal(page.button.disabled, true);
  assert.match(page.status.textContent, /Thank you/);
});
