import { resolveBoluoConfig } from '../../core/config.js';
import { BoluoAgentKitError } from '../../core/errors.js';
import { requestBoluoOpenApi } from '../../core/http-client.js';
import {
  boluoOpenApiRegistry,
  getRegistryOperation,
} from '../../registry/index.js';
import type { RegistryMethod, RegistryParameter } from '../../registry/types.js';

type RegistryCliOptions = {
  data?: Record<string, unknown>;
  json?: boolean;
  openApiEndpoint?: string;
  openApiKey?: string;
  params?: Record<string, unknown>;
  yes?: boolean;
};

type RunRegistryCommandOptions = {
  parseFlatParams?: boolean;
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

function parseRegistryOptions(
  args: string[],
  operation?: RegistryMethod,
  parseFlatParams = false,
): RegistryCliOptions {
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

    const flatParam = parseFlatParams && operation
      ? operation.parameters.find((parameter) => `--${toKebabCase(parameter.name)}` === flag)
      : undefined;
    if (!valueFlags.has(flag) && !flatParam) {
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
    } else if (flatParam) {
      options.params = {
        ...options.params,
        [flatParam.name]: readFlatParamValue(args, index, flag, flatParam),
      };
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
  options: RunRegistryCommandOptions = {},
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
  const cliOptions = parseRegistryOptions(args, operation, options.parseFlatParams);

  if (operation.httpMethod === 'GET' && cliOptions.data !== undefined) {
    throw new BoluoAgentKitError(
      'INVALID_INPUT',
      '--data 不能用于 GET 接口',
    );
  }

  if (operation.risk === 'high-risk-write' && !cliOptions.yes) {
    throw new BoluoAgentKitError(
      'CONFIRMATION_REQUIRED',
      `高风险接口需要显式确认：${domain} ${resource} ${method}`,
    );
  }

  return requestBoluoOpenApi({
    body: cliOptions.data,
    config: resolveBoluoConfig({
      apiEndpoint: cliOptions.openApiEndpoint,
      openApiKey: cliOptions.openApiKey,
    }),
    method: operation.httpMethod,
    params: cliOptions.params,
    path: operation.path,
  });
}

function readFlatParamValue(
  args: string[],
  index: number,
  flag: string,
  parameter: RegistryParameter,
): unknown {
  const rawValue = readFlagValue(args, index, flag);
  const schema = parameter.schema && typeof parameter.schema === 'object' && !Array.isArray(parameter.schema)
    ? parameter.schema as { type?: unknown }
    : {};

  if (schema.type === 'integer' || schema.type === 'number') {
    const value = Number(rawValue);
    if (Number.isNaN(value)) {
      throw new BoluoAgentKitError(
        'INVALID_INPUT',
        `${flag} 必须是数字`,
      );
    }
    return value;
  }

  if (schema.type === 'boolean') {
    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;
    throw new BoluoAgentKitError(
      'INVALID_INPUT',
      `${flag} 必须是 true 或 false`,
    );
  }

  if (schema.type === 'array') {
    return rawValue.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return rawValue;
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
