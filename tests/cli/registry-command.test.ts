import assert from 'node:assert/strict';
import test from 'node:test';

import { runCli } from '../../src/cli/index.js';

test('CLI registry GET command executes generated operation with params', async () => {
  const originalFetch = globalThis.fetch;
  const output: string[] = [];
  let calledUrl = '';
  let calledHeaders: HeadersInit | undefined;

  globalThis.fetch = async (input, init) => {
    calledUrl = String(input);
    calledHeaders = init?.headers;
    return new Response(
      JSON.stringify({
        code: 0,
        data: {
          list: [],
          total: 0,
        },
      }),
      { status: 200 },
    );
  };

  try {
    const exitCode = await runCli(
      [
        'material',
        'zc-material',
        'page',
        '--openapi-key',
        'openapi-key',
        '--params',
        '{"searchKey":"海报"}',
        '--json',
      ],
      (text) => output.push(text),
      (text) => output.push(text),
    );

    assert.equal(exitCode, 0);
    assert.equal(
      calledUrl,
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/page?searchKey=%E6%B5%B7%E6%8A%A5',
    );
    assert.deepEqual(calledHeaders, {
      'X-OpenApi-Key': 'openapi-key',
      Accept: 'application/json',
    });
    assert.deepEqual(JSON.parse(output.join('')), {
      ok: true,
      data: {
        list: [],
        total: 0,
      },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('CLI registry GET command rejects body data before fetching', async () => {
  const originalFetch = globalThis.fetch;
  const output: string[] = [];
  let fetchCalled = false;

  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({ code: 0, data: true }), { status: 200 });
  };

  try {
    const exitCode = await runCli(
      [
        'material',
        'zc-material',
        'page',
        '--openapi-key',
        'openapi-key',
        '--data',
        '{}',
        '--json',
      ],
      (text) => output.push(text),
      (text) => output.push(text),
    );

    assert.equal(exitCode, 1);
    assert.equal(fetchCalled, false);
    assert.deepEqual(JSON.parse(output.join('')), {
      ok: false,
      error: {
        code: 'INVALID_INPUT',
        message: '--data 不能用于 GET 接口',
      },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('CLI registry command prints JSON error when generated command is missing', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['material', 'zc-material', 'missing', '--json'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  assert.equal(exitCode, 1);
  assert.deepEqual(JSON.parse(output.join('')), {
    ok: false,
    error: {
      code: 'COMMAND_NOT_FOUND',
      message: '未知接口命令：material zc-material missing',
    },
  });
});

test('CLI registry command preserves missing JSON flag value errors', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['material', 'zc-material', 'page', '--params', '--json'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  assert.equal(exitCode, 1);
  assert.deepEqual(JSON.parse(output.join('')), {
    ok: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: '缺少参数值：--params',
    },
  });
});

test('CLI registry command reports JSON command-not-found when method is missing', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['material', 'zc-material', '--json'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  assert.equal(exitCode, 1);
  assert.deepEqual(JSON.parse(output.join('')), {
    ok: false,
    error: {
      code: 'COMMAND_NOT_FOUND',
      message: '未知接口命令：material zc-material',
    },
  });
});

test('CLI registry DELETE command requires confirmation before fetching', async () => {
  const originalFetch = globalThis.fetch;
  const output: string[] = [];
  let fetchCalled = false;

  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response(JSON.stringify({ code: 0, data: true }), { status: 200 });
  };

  try {
    const exitCode = await runCli(
      [
        'material',
        'zc-material',
        'delete',
        '--openapi-key',
        'openapi-key',
        '--params',
        '{"id":123}',
        '--json',
      ],
      (text) => output.push(text),
      (text) => output.push(text),
    );

    assert.equal(exitCode, 1);
    assert.equal(fetchCalled, false);
    assert.deepEqual(JSON.parse(output.join('')), {
      ok: false,
      error: {
        code: 'CONFIRMATION_REQUIRED',
        message: '高风险接口需要显式确认：material zc-material delete',
      },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('CLI registry DELETE command executes after confirmation', async () => {
  const originalFetch = globalThis.fetch;
  const output: string[] = [];
  let calledUrl = '';
  let calledMethod = '';

  globalThis.fetch = async (input, init) => {
    calledUrl = String(input);
    calledMethod = String(init?.method);
    return new Response(JSON.stringify({ code: 0, data: true }), { status: 200 });
  };

  try {
    const exitCode = await runCli(
      [
        'material',
        'zc-material',
        'delete',
        '--openapi-key',
        'openapi-key',
        '--params',
        '{"id":123}',
        '--yes',
        '--json',
      ],
      (text) => output.push(text),
      (text) => output.push(text),
    );

    assert.equal(exitCode, 0);
    assert.equal(calledMethod, 'DELETE');
    assert.equal(
      calledUrl,
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/delete?id=123',
    );
    assert.deepEqual(JSON.parse(output.join('')), {
      ok: true,
      data: true,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('CLI unknown top-level command does not enter registry fallback', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['future', 'zc-material', 'page', '--json'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  assert.equal(exitCode, 1);
  assert.deepEqual(JSON.parse(output.join('')), {
    ok: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: '未知命令：future',
    },
  });
});
