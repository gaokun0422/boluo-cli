import { BoluoAgentKitError } from './errors.js';
import type { ResolvedBoluoConfig } from './config.js';

export type JavaAdminRequestOptions = {
  body?: unknown;
  config: ResolvedBoluoConfig;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  params?: Record<string, unknown>;
  path: string;
};

function appendQueryParams(url: URL, params?: Record<string, unknown>) {
  if (!params) return;

  // Java Admin 数组参数按重复 key 传递，空值不参与查询串。
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null || item === '') continue;
        url.searchParams.append(key, String(item));
      }
      continue;
    }
    url.searchParams.set(key, String(value));
  }
}

export async function requestBoluoOpenApi<T>(
  options: JavaAdminRequestOptions,
): Promise<T> {
  const url = new URL(
    `${options.config.apiEndpoint.replace(/\/$/, '')}${options.path}`,
  );
  appendQueryParams(url, options.params);

  let response: Response;
  try {
    response = await fetch(url, {
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers: {
        ...options.config.headers,
        Accept: 'application/json',
        ...(options.body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
      },
      method: options.method || 'GET',
    });
  } catch (error) {
    throw new BoluoAgentKitError(
      'JAVA_API_ERROR',
      `Java OpenAPI 接口请求异常：${options.path}`,
      { cause: error },
    );
  }

  const responseText = await response.text();
  if (!response.ok) {
    throw new BoluoAgentKitError(
      'JAVA_API_ERROR',
      `Java OpenAPI 接口调用失败：${options.path} ${response.status}`,
      { status: response.status },
    );
  }

  if (!responseText) {
    throw new BoluoAgentKitError(
      'JAVA_RESPONSE_CONTRACT_ERROR',
      `Java OpenAPI 接口返回空响应：${options.path}`,
    );
  }

  let payload: { code?: number; data?: T; msg?: string };
  try {
    payload = JSON.parse(responseText) as {
      code?: number;
      data?: T;
      msg?: string;
    };
  } catch (error) {
    throw new BoluoAgentKitError(
      'JAVA_RESPONSE_CONTRACT_ERROR',
      `Java OpenAPI 接口返回非 JSON：${options.path}`,
      { cause: error },
    );
  }

  if (typeof payload.code !== 'number') {
    throw new BoluoAgentKitError(
      'JAVA_RESPONSE_CONTRACT_ERROR',
      `Java OpenAPI 接口返回结构缺少 code：${options.path}`,
    );
  }

  if (payload.code !== 0) {
    throw new BoluoAgentKitError(
      'JAVA_API_ERROR',
      payload.msg || `Java OpenAPI 接口业务失败：${options.path} code ${payload.code}`,
    );
  }

  return payload.data as T;
}
