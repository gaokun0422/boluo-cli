import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_API_ENDPOINT,
  resolveBoluoConfig,
} from '../../src/core/config.js';
import { requestBoluoOpenApi } from '../../src/core/http-client.js';
import { BoluoAgentKitError } from '../../src/core/errors.js';

test('resolveBoluoConfig uses defaults and explicit OpenAPI key', () => {
  const config = resolveBoluoConfig({
    openApiKey: 'openapi-key',
  });

  assert.equal(config.apiEndpoint, DEFAULT_API_ENDPOINT);
  assert.deepEqual(config.headers, {
    'X-OpenApi-Key': 'openapi-key',
  });
});

test('resolveBoluoConfig explicit fields win over headers and env', () => {
  const originalOpenApiKey = process.env.BOLUO_OPENAPI_KEY;
  const originalApiEndpoint = process.env.BOLUO_OPENAPI_ENDPOINT;

  process.env.BOLUO_OPENAPI_KEY = 'env-key';
  process.env.BOLUO_OPENAPI_ENDPOINT = 'https://env.example.com';

  try {
    const config = resolveBoluoConfig({
      apiEndpoint: 'https://explicit.example.com',
      headers: {
        'X-OpenApi-Key': 'header-key',
      },
      openApiKey: 'explicit-key',
    });

    assert.equal(config.apiEndpoint, 'https://explicit.example.com');
    assert.deepEqual(config.headers, {
      'X-OpenApi-Key': 'explicit-key',
    });
  } finally {
    if (originalOpenApiKey === undefined) {
      delete process.env.BOLUO_OPENAPI_KEY;
    } else {
      process.env.BOLUO_OPENAPI_KEY = originalOpenApiKey;
    }
    if (originalApiEndpoint === undefined) {
      delete process.env.BOLUO_OPENAPI_ENDPOINT;
    } else {
      process.env.BOLUO_OPENAPI_ENDPOINT = originalApiEndpoint;
    }
  }
});

test('resolveBoluoConfig reads supported OpenAPI key header variants', () => {
  const originalOpenApiKey = process.env.BOLUO_OPENAPI_KEY;
  const originalApiEndpoint = process.env.BOLUO_OPENAPI_ENDPOINT;

  delete process.env.BOLUO_OPENAPI_KEY;
  delete process.env.BOLUO_OPENAPI_ENDPOINT;

  try {
    assert.deepEqual(
      resolveBoluoConfig({
        headers: {
          'X-OpenApi-Key': 'upper-key',
        },
      }).headers,
      {
        'X-OpenApi-Key': 'upper-key',
      },
    );
    assert.deepEqual(
      resolveBoluoConfig({
        headers: {
          'x-openapi-key': 'lower-key',
        },
      }).headers,
      {
        'X-OpenApi-Key': 'lower-key',
      },
    );
  } finally {
    if (originalOpenApiKey === undefined) {
      delete process.env.BOLUO_OPENAPI_KEY;
    } else {
      process.env.BOLUO_OPENAPI_KEY = originalOpenApiKey;
    }
    if (originalApiEndpoint === undefined) {
      delete process.env.BOLUO_OPENAPI_ENDPOINT;
    } else {
      process.env.BOLUO_OPENAPI_ENDPOINT = originalApiEndpoint;
    }
  }
});

test('resolveBoluoConfig reads supported env values', () => {
  const originalOpenApiKey = process.env.BOLUO_OPENAPI_KEY;
  const originalApiEndpoint = process.env.BOLUO_OPENAPI_ENDPOINT;

  process.env.BOLUO_OPENAPI_KEY = 'env-key';
  process.env.BOLUO_OPENAPI_ENDPOINT = 'https://env.example.com';

  try {
    assert.deepEqual(resolveBoluoConfig(), {
      apiEndpoint: 'https://env.example.com',
      headers: {
        'X-OpenApi-Key': 'env-key',
      },
    });
  } finally {
    if (originalOpenApiKey === undefined) {
      delete process.env.BOLUO_OPENAPI_KEY;
    } else {
      process.env.BOLUO_OPENAPI_KEY = originalOpenApiKey;
    }
    if (originalApiEndpoint === undefined) {
      delete process.env.BOLUO_OPENAPI_ENDPOINT;
    } else {
      process.env.BOLUO_OPENAPI_ENDPOINT = originalApiEndpoint;
    }
  }
});

test('resolveBoluoConfig requires OpenAPI key', () => {
  const originalOpenApiKey = process.env.BOLUO_OPENAPI_KEY;

  delete process.env.BOLUO_OPENAPI_KEY;

  try {
    assert.throws(
      () => resolveBoluoConfig({}),
      (error) =>
        error instanceof BoluoAgentKitError &&
        error.code === 'MISSING_OPENAPI_KEY',
    );
  } finally {
    if (originalOpenApiKey === undefined) {
      delete process.env.BOLUO_OPENAPI_KEY;
    } else {
      process.env.BOLUO_OPENAPI_KEY = originalOpenApiKey;
    }
  }
});

test('requestBoluoOpenApi serializes array query params and unwraps data', async () => {
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];

  globalThis.fetch = async (input) => {
    urls.push(String(input));
    return new Response(
      JSON.stringify({
        code: 0,
        data: { total: 1 },
      }),
      { status: 200 },
    );
  };

  try {
    const result = await requestBoluoOpenApi<{ total: number }>({
      config: {
        apiEndpoint: 'https://api3.boluo-ai.com',
        headers: { 'X-OpenApi-Key': 'openapi-key' },
      },
      params: {
        mtypeList: ['img', 'video'],
        pageNo: 1,
      },
      path: '/app-api/boluo/open-api/zc-material/page',
    });

    assert.equal(result.total, 1);
    assert.equal(
      urls[0],
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/page?mtypeList=img&mtypeList=video&pageNo=1',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestBoluoOpenApi skips empty array query param items', async () => {
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];

  globalThis.fetch = async (input) => {
    urls.push(String(input));
    return new Response(
      JSON.stringify({
        code: 0,
        data: { total: 1 },
      }),
      { status: 200 },
    );
  };

  try {
    await requestBoluoOpenApi<{ total: number }>({
      config: {
        apiEndpoint: 'https://api3.boluo-ai.com',
        headers: { 'X-OpenApi-Key': 'openapi-key' },
      },
      params: {
        mtypeList: ['img', undefined, null, '', 'video'],
        pageNo: 1,
      },
      path: '/app-api/boluo/open-api/zc-material/page',
    });

    assert.equal(
      urls[0],
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/page?mtypeList=img&mtypeList=video&pageNo=1',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestBoluoOpenApi skips empty top-level query params', async () => {
  const originalFetch = globalThis.fetch;
  const urls: string[] = [];

  globalThis.fetch = async (input) => {
    urls.push(String(input));
    return new Response(JSON.stringify({ code: 0, data: { total: 1 } }), {
      status: 200,
    });
  };

  try {
    await requestBoluoOpenApi<{ total: number }>({
      config: {
        apiEndpoint: 'https://api3.boluo-ai.com',
        headers: { 'X-OpenApi-Key': 'openapi-key' },
      },
      params: {
        empty: '',
        missing: undefined,
        none: null,
        pageNo: 1,
        searchKey: '素材',
      },
      path: '/app-api/boluo/open-api/zc-material/page',
    });

    assert.equal(
      urls[0],
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/page?pageNo=1&searchKey=%E7%B4%A0%E6%9D%90',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestBoluoOpenApi sends JSON headers based on body presence', async () => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{
    body?: BodyInit | null;
    headers?: HeadersInit;
  }> = [];

  globalThis.fetch = async (_input, init) => {
    requests.push({
      body: init?.body,
      headers: init?.headers,
    });
    return new Response(JSON.stringify({ code: 0, data: { ok: true } }), {
      status: 200,
    });
  };

  try {
    await requestBoluoOpenApi<{ ok: boolean }>({
      config: {
        apiEndpoint: 'https://api3.boluo-ai.com',
        headers: { 'X-OpenApi-Key': 'openapi-key' },
      },
      path: '/app-api/boluo/open-api/zc-material/page',
    });
    await requestBoluoOpenApi<{ ok: boolean }>({
      body: { name: '素材' },
      config: {
        apiEndpoint: 'https://api3.boluo-ai.com',
        headers: { 'X-OpenApi-Key': 'openapi-key' },
      },
      method: 'POST',
      path: '/app-api/boluo/open-api/zc-material/page',
    });

    assert.deepEqual(requests[0]?.headers, {
      'X-OpenApi-Key': 'openapi-key',
      Accept: 'application/json',
    });
    assert.deepEqual(requests[1]?.headers, {
      'X-OpenApi-Key': 'openapi-key',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    assert.equal(requests[0]?.body, undefined);
    assert.equal(requests[1]?.body, JSON.stringify({ name: '素材' }));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestBoluoOpenApi maps failed HTTP responses to BoluoAgentKitError', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ code: 0, data: null }), { status: 500 });

  try {
    await assert.rejects(
      () =>
        requestBoluoOpenApi<unknown>({
          config: {
            apiEndpoint: 'https://api3.boluo-ai.com',
            headers: { 'X-OpenApi-Key': 'openapi-key' },
          },
          path: '/app-api/boluo/open-api/zc-material/page',
        }),
      (error) =>
        error instanceof BoluoAgentKitError &&
        error.code === 'JAVA_API_ERROR' &&
        error.status === 500,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestBoluoOpenApi rejects invalid JSON responses', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => new Response('not json', { status: 200 });

  try {
    await assert.rejects(
      () =>
        requestBoluoOpenApi<unknown>({
          config: {
            apiEndpoint: 'https://api3.boluo-ai.com',
            headers: { 'X-OpenApi-Key': 'openapi-key' },
          },
          path: '/app-api/boluo/open-api/zc-material/page',
        }),
      (error) =>
        error instanceof BoluoAgentKitError &&
        error.code === 'JAVA_RESPONSE_CONTRACT_ERROR',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestBoluoOpenApi rejects empty successful responses', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => new Response('', { status: 200 });

  try {
    await assert.rejects(
      () =>
        requestBoluoOpenApi<unknown>({
          config: {
            apiEndpoint: 'https://api3.boluo-ai.com',
            headers: { 'X-OpenApi-Key': 'openapi-key' },
          },
          path: '/app-api/boluo/open-api/zc-material/page',
        }),
      (error) =>
        error instanceof BoluoAgentKitError &&
        error.code === 'JAVA_RESPONSE_CONTRACT_ERROR',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestBoluoOpenApi rejects nonzero Java payload codes', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ code: 1001, msg: '业务失败' }), {
      status: 200,
    });

  try {
    await assert.rejects(
      () =>
        requestBoluoOpenApi<unknown>({
          config: {
            apiEndpoint: 'https://api3.boluo-ai.com',
            headers: { 'X-OpenApi-Key': 'openapi-key' },
          },
          path: '/app-api/boluo/open-api/zc-material/page',
        }),
      (error) =>
        error instanceof BoluoAgentKitError &&
        error.code === 'JAVA_API_ERROR' &&
        error.message === '业务失败',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestBoluoOpenApi rejects payloads without numeric code', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ total: 1 }), { status: 200 });

  try {
    await assert.rejects(
      () =>
        requestBoluoOpenApi<unknown>({
          config: {
            apiEndpoint: 'https://api3.boluo-ai.com',
            headers: { 'X-OpenApi-Key': 'openapi-key' },
          },
          path: '/app-api/boluo/open-api/zc-material/page',
        }),
      (error) =>
        error instanceof BoluoAgentKitError &&
        error.code === 'JAVA_RESPONSE_CONTRACT_ERROR',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('requestBoluoOpenApi converts fetch failures to BoluoAgentKitError', async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    throw new Error('network down');
  };

  try {
    await assert.rejects(
      () =>
        requestBoluoOpenApi<unknown>({
          config: {
            apiEndpoint: 'https://api3.boluo-ai.com',
            headers: { 'X-OpenApi-Key': 'openapi-key' },
          },
          path: '/app-api/boluo/open-api/zc-material/page',
        }),
      (error) =>
        error instanceof BoluoAgentKitError &&
        error.code === 'JAVA_API_ERROR' &&
        error.message.includes('Java OpenAPI 接口请求异常') &&
        error.cause instanceof Error &&
        error.cause.message === 'network down',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

