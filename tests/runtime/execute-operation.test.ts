import assert from 'node:assert/strict';
import test from 'node:test';

import { BoluoAgentKitError } from '../../src/core/errors.js';
import { executeBoluoRuntimeOperation } from '../../src/runtime/execute-operation.js';

test('executeBoluoRuntimeOperation rejects missing OpenAPI key', async () => {
  await assert.rejects(
    executeBoluoRuntimeOperation({
      auth: {},
      input: {},
      ref: 'material.zc-material.page',
    }),
    /缺少 X-OpenApi-Key，无法调用菠萝 OpenAPI 能力/,
  );
});

test('executeBoluoRuntimeOperation checks auth before operation lookup', async () => {
  await assert.rejects(
    () =>
      executeBoluoRuntimeOperation({
        input: {},
        ref: 'material.zc-material.nope',
      }),
    /缺少 X-OpenApi-Key，无法调用菠萝 OpenAPI 能力/,
  );
});

test('executeBoluoRuntimeOperation rejects missing operation ref', async () => {
  await assert.rejects(
    () =>
      executeBoluoRuntimeOperation({
        auth: {
          openApiKey: 'openapi-key',
        },
        input: {},
        ref: 'material.zc-material.nope',
      }),
    /未找到接口：material.zc-material.nope/,
  );
});

test('executeBoluoRuntimeOperation normalizes malformed ref error', async () => {
  await assert.rejects(
    () =>
      executeBoluoRuntimeOperation({
        auth: {
          openApiKey: 'openapi-key',
        },
        input: {},
        ref: 'bad-ref',
      }),
    (error) => {
      assert.ok(error instanceof BoluoAgentKitError);
      assert.equal(error.code, 'COMMAND_NOT_FOUND');
      assert.equal(error.message, '接口引用格式错误：bad-ref');
      return true;
    },
  );
});

test('executeBoluoRuntimeOperation calls GET operation with params', async () => {
  const originalFetch = globalThis.fetch;
  const calls: { init?: RequestInit; url: string }[] = [];

  globalThis.fetch = (async (input, init) => {
    calls.push({
      init,
      url: String(input),
    });

    return new Response(
      JSON.stringify({
        code: 0,
        data: {
          list: [{ id: 657059, mtype: 'img', name: '海报素材' }],
          total: 1,
          ignored: 'removed',
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  }) as typeof fetch;

  try {
    const result = await executeBoluoRuntimeOperation({
      auth: {
        openApiKey: 'openapi-key',
      },
      input: {
        searchKey: '海报',
      },
      ref: 'material.zc-material.page',
    });

    assert.equal(
      calls[0].url,
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/page?searchKey=%E6%B5%B7%E6%8A%A5',
    );
    assert.equal(calls[0].init?.method, 'GET');
    assert.equal(calls[0].init?.body, undefined);
    assert.deepEqual(result, {
      list: [{ id: 657059, mtype: 'img', name: '海报素材' }],
      total: 1,
      ignored: 'removed',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('executeBoluoRuntimeOperation sends documented query params for DELETE operation', async () => {
  const originalFetch = globalThis.fetch;
  const calls: { init?: RequestInit; url: string }[] = [];

  globalThis.fetch = (async (input, init) => {
    calls.push({
      init,
      url: String(input),
    });

    return new Response(
      JSON.stringify({
        code: 0,
        data: true,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  }) as typeof fetch;

  try {
    const result = await executeBoluoRuntimeOperation({
      auth: {
        openApiKey: 'openapi-key',
      },
      input: {
        id: 656303,
      },
      ref: 'material.zc-material.delete',
    });

    assert.equal(
      calls[0].url,
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/delete?id=656303',
    );
    assert.equal(calls[0].init?.method, 'DELETE');
    assert.equal(calls[0].init?.body, undefined);
    assert.equal(result, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('executeBoluoRuntimeOperation calls non-GET operation with JSON body', async () => {
  const originalFetch = globalThis.fetch;
  const calls: { init?: RequestInit; url: string }[] = [];

  globalThis.fetch = (async (input, init) => {
    calls.push({
      init,
      url: String(input),
    });

    return new Response(
      JSON.stringify({
        code: 0,
        data: {
          id: 1,
          name: '新素材',
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  }) as typeof fetch;

  try {
    const result = await executeBoluoRuntimeOperation({
      auth: {
        openApiKey: 'openapi-key',
      },
      input: {
        name: '新素材',
      },
      ref: 'material.zc-material.create',
    });

    assert.equal(
      calls[0].url,
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/create',
    );
    assert.equal(calls[0].init?.method, 'POST');
    assert.equal(calls[0].init?.body, JSON.stringify({ name: '新素材' }));
    assert.equal(
      new Headers(calls[0].init?.headers).get('Content-Type'),
      'application/json',
    );
    assert.deepEqual(result, {
      id: 1,
      name: '新素材',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
