import process from 'node:process';

import { DEFAULT_API_ENDPOINT, resolveBoluoConfig } from '../../core/config.js';
import { BoluoAgentKitError } from '../../core/errors.js';
import { requestBoluoOpenApi } from '../../core/http-client.js';

type DoctorCliOptions = {
  checkApi?: boolean;
  json?: boolean;
  openApiEndpoint?: string;
  openApiKey?: string;
};

const booleanFlags = new Set(['--check-api', '--json']);
const valueFlags = new Set([
  '--openapi-endpoint',
  '--openapi-key',
]);

function readFlagValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`缺少参数值：${flag}`);
  }
  return value;
}

export function hasDoctorJsonFlag(args: string[]): boolean {
  return args[0] === 'doctor' && args.includes('--json');
}

export function parseDoctorOptions(args: string[]): DoctorCliOptions {
  const options: DoctorCliOptions = {};

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!flag?.startsWith('--')) {
      throw new Error(`未知参数：${flag}`);
    }

    if (booleanFlags.has(flag)) {
      if (flag === '--check-api') options.checkApi = true;
      if (flag === '--json') options.json = true;
      continue;
    }

    if (!valueFlags.has(flag)) {
      throw new Error(`未知参数：${flag}`);
    }

    if (flag === '--openapi-endpoint') {
      options.openApiEndpoint = readFlagValue(args, index, flag);
    } else if (flag === '--openapi-key') {
      options.openApiKey = readFlagValue(args, index, flag);
    }
    index += 1;
  }

  return options;
}

export async function runDoctorCommand(args: string[]): Promise<unknown> {
  const options = parseDoctorOptions(args);
  const checks: Record<string, unknown> = {
    node: {
      ok: Number(process.versions.node.split('.')[0]) >= 20,
      version: process.version,
    },
    dist: {
      // doctor 从 dist 运行时，import.meta.url 会落在 dist/cli/commands 下；开发态也允许直接从 src 跑测试。
      ok:
        import.meta.url.includes('/dist/') ||
        import.meta.url.includes('\\dist\\') ||
        import.meta.url.includes('/src/') ||
        import.meta.url.includes('\\src\\'),
    },
  };

  try {
    const config = resolveBoluoConfig({
      apiEndpoint: options.openApiEndpoint,
      openApiKey: options.openApiKey,
    });
    checks.config = {
      ok: true,
      apiEndpoint: config.apiEndpoint,
      hasOpenApiKey: Boolean(config.headers['X-OpenApi-Key']),
    };
  } catch (error) {
    checks.config = {
      ok: false,
      apiEndpoint:
        options.openApiEndpoint || process.env.BOLUO_OPENAPI_ENDPOINT || DEFAULT_API_ENDPOINT,
      code:
        error instanceof BoluoAgentKitError
          ? error.code
          : 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : String(error),
    };
  }

  if (options.checkApi) {
    try {
      await requestBoluoOpenApi({
        config: resolveBoluoConfig({
          apiEndpoint: options.openApiEndpoint,
          openApiKey: options.openApiKey,
        }),
        params: {
          pageNo: 1,
          pageSize: 1,
        },
        path: '/app-api/boluo/open-api/zc-material/page',
      });
      checks.api = { ok: true };
    } catch (error) {
      checks.api = {
        ok: false,
        code:
          error instanceof BoluoAgentKitError
            ? error.code
            : 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    name: 'boluo-cli',
    checks,
  };
}
