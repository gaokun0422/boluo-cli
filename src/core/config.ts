import process from 'node:process';

import { BoluoAgentKitError } from './errors.js';

export const DEFAULT_API_ENDPOINT = 'https://api3.boluo-ai.com';

export type BoluoConfigInput = {
  apiEndpoint?: string;
  openApiKey?: string;
  headers?: Record<string, string | undefined>;
};

export type ResolvedBoluoConfig = {
  apiEndpoint: string;
  headers: Record<string, string>;
};

export function resolveBoluoConfig(
  input: BoluoConfigInput = {},
): ResolvedBoluoConfig {
  // Agent 专用 OpenAPI 只使用 X-OpenApi-Key 鉴权，不依赖用户登录态或租户头。
  const openApiKey =
    input.openApiKey ||
    input.headers?.['X-OpenApi-Key'] ||
    input.headers?.['x-openapi-key'] ||
    process.env.BOLUO_OPENAPI_KEY;

  if (!openApiKey) {
    throw new BoluoAgentKitError(
      'MISSING_OPENAPI_KEY',
      '缺少 BOLUO_OPENAPI_KEY 或 X-OpenApi-Key 配置',
    );
  }

  return {
    apiEndpoint:
      input.apiEndpoint || process.env.BOLUO_OPENAPI_ENDPOINT || DEFAULT_API_ENDPOINT,
    headers: {
      'X-OpenApi-Key': openApiKey,
    },
  };
}
