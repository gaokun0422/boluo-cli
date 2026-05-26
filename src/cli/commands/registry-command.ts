import { resolveBoluoConfig } from '../../core/config.js';
import { BoluoAgentKitError } from '../../core/errors.js';
import { requestBoluoOpenApi } from '../../core/http-client.js';
import {
  boluoOpenApiRegistry,
  getRegistryOperation,
} from '../../registry/index.js';

type RegistryCliOptions = {
  data?: Record<string, unknown>;
  json?: boolean;
  openApiEndpoint?: string;
  openApiKey?: string;
  params?: Record<string, unknown>;
  yes?: boolean;
};

const booleanFlags = new Set(['--json', '--yes']);
const valueFlags = new Set([
  '--data',
  '--openapi-endpoint',
  '--openapi-key',
  '--params',
]);

function readFlagValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`缺少参数值：${flag}`);
  }
  return value;
}

function readJsonObjectFlag(
  args: string[],
  index: number,
  flag: string,
): Record<string, unknown> {
  const rawValue = readFlagValue(args, index, flag);
  let value: unknown;
  try {
    value = JSON.parse(rawValue);
  } catch (error) {
    throw new BoluoAgentKitError(
      'INVALID_INPUT',
      `${flag} 必须是 JSON 对象`,
      { cause: error },
    );
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BoluoAgentKitError(
      'INVALID_INPUT',
      `${flag} 必须是 JSON 对象`,
    );
  }

  return value as Record<string, unknown>;
}

function parseRegistryOptions(args: string[]): RegistryCliOptions {
  const options: RegistryCliOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!flag?.startsWith('--')) {
      throw new Error(`未知参数：${flag}`);
    }

    if (booleanFlags.has(flag)) {
      if (flag === '--json') options.json = true;
      if (flag === '--yes') options.yes = true;
      continue;
    }

    if (!valueFlags.has(flag)) {
      throw new Error(`未知参数：${flag}`);
    }

    if (flag === '--data') {
      options.data = readJsonObjectFlag(args, index, flag);
    } else if (flag === '--openapi-endpoint') {
      options.openApiEndpoint = readFlagValue(args, index, flag);
    } else if (flag === '--openapi-key') {
      options.openApiKey = readFlagValue(args, index, flag);
    } else if (flag === '--params') {
      options.params = readJsonObjectFlag(args, index, flag);
    }
    index += 1;
  }

  return options;
}

function unknownCommandMessage(
  domain: string | undefined,
  resource: string | undefined,
  method: string | undefined,
): string {
  return `未知接口命令：${[domain, resource, method].filter(Boolean).join(' ')}`;
}

export async function runRegistryCommand(
  domain: string | undefined,
  resource: string | undefined,
  method: string | undefined,
  args: string[],
): Promise<unknown> {
  if (!domain || !resource || !method) {
    throw new BoluoAgentKitError(
      'COMMAND_NOT_FOUND',
      unknownCommandMessage(domain, resource, method),
    );
  }

  const result = getRegistryOperation(`${domain}.${resource}.${method}`);
  if (result === undefined) {
    throw new BoluoAgentKitError(
      'COMMAND_NOT_FOUND',
      unknownCommandMessage(domain, resource, method),
    );
  }

  const operation =
    boluoOpenApiRegistry.domains[result.domain].resources[result.resource]
      .methods[result.method];
  const options = parseRegistryOptions(args);

  if (operation.httpMethod === 'GET' && options.data !== undefined) {
    throw new BoluoAgentKitError(
      'INVALID_INPUT',
      '--data 不能用于 GET 接口',
    );
  }

  if (operation.risk === 'high-risk-write' && !options.yes) {
    throw new BoluoAgentKitError(
      'CONFIRMATION_REQUIRED',
      `高风险接口需要显式确认：${domain} ${resource} ${method}`,
    );
  }

  return requestBoluoOpenApi({
    body: options.data,
    config: resolveBoluoConfig({
      apiEndpoint: options.openApiEndpoint,
      openApiKey: options.openApiKey,
    }),
    method: operation.httpMethod,
    params: options.params,
    path: operation.path,
  });
}
