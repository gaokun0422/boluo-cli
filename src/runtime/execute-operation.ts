import { resolveBoluoConfig } from '../core/config.js';
import { BoluoAgentKitError } from '../core/errors.js';
import { requestBoluoOpenApi } from '../core/http-client.js';
import {
  boluoOpenApiRegistry,
  getRegistryOperation,
} from '../registry/index.js';

export type BoluoRuntimeAuth = {
  openApiEndpoint?: string;
  openApiKey?: string;
};

export type ExecuteBoluoRuntimeOperationInput = {
  auth?: BoluoRuntimeAuth;
  input: Record<string, unknown>;
  ref: string;
};

export async function executeBoluoRuntimeOperation<T = unknown>(
  options: ExecuteBoluoRuntimeOperationInput,
): Promise<T> {
  // 工具 execute 必须二次校验鉴权，避免模型绕过上层运行时约束。
  if (!options.auth?.openApiKey) {
    throw new BoluoAgentKitError(
      'MISSING_OPENAPI_KEY',
      '缺少 X-OpenApi-Key，无法调用菠萝 OpenAPI 能力',
    );
  }

  let operationRef: ReturnType<typeof getRegistryOperation>;
  try {
    operationRef = getRegistryOperation(options.ref);
  } catch (error) {
    // 运行时对外只暴露稳定错误码，避免非法 ref 变成 UNKNOWN_ERROR。
    throw new BoluoAgentKitError(
      'COMMAND_NOT_FOUND',
      error instanceof Error ? error.message : `未找到接口：${options.ref}`,
    );
  }

  if (!operationRef) {
    throw new BoluoAgentKitError(
      'COMMAND_NOT_FOUND',
      `未找到接口：${options.ref}`,
    );
  }

  const operation =
    boluoOpenApiRegistry.domains[operationRef.domain].resources[
      operationRef.resource
    ].methods[operationRef.method];

  const config = resolveBoluoConfig({
    apiEndpoint: options.auth.openApiEndpoint,
    openApiKey: options.auth.openApiKey,
  });
  const input = options.input || {};
  const queryParamNames = new Set(
    operation.parameters
      .filter((parameter) => parameter.in === 'query')
      .map((parameter) => parameter.name),
  );
  const params = Object.fromEntries(
    Object.entries(input).filter(([key]) => queryParamNames.has(key)),
  );
  const body = operation.requestBody
    ? Object.fromEntries(
      Object.entries(input).filter(([key]) => !queryParamNames.has(key)),
    )
    : undefined;

  return await requestBoluoOpenApi<T>({
    config,
    method: operation.httpMethod,
    path: operation.path,
    ...(Object.keys(params).length > 0 ? { params } : {}),
    ...(operation.requestBody ? { body } : {}),
  });
}
