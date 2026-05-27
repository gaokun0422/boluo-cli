import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  hasDoctorJsonFlag,
  runDoctorCommand,
} from './commands/doctor.js';
import { runRegistryCommand } from './commands/registry-command.js';
import { runSchemaCommand } from './commands/schema.js';
import {
  writeJsonError,
  writeJsonSuccess,
  type WriteLine,
} from './output.js';
import { boluoOpenApiRegistry } from '../registry/index.js';

let packageDir = path.dirname(fileURLToPath(import.meta.url));
while (!fs.existsSync(path.join(packageDir, 'package.json'))) {
  const parentDir = path.dirname(packageDir);
  if (parentDir === packageDir) {
    throw new Error('找不到 package.json');
  }
  packageDir = parentDir;
}

const require = createRequire(import.meta.url);
const { version: VERSION } = require(path.join(packageDir, 'package.json')) as {
  version: string;
};

const HELP_TEXT = `boluo-cli ${VERSION}

Usage:
  boluo-cli help | --help
  boluo-cli --version
  boluo-cli doctor --json [--check-api]
  boluo-cli schema <domain.resource.method>
  boluo-cli <domain> +<method> [--field value] --json
  boluo-cli <domain> <method> [--params <json>] [--data <json>] --json [--yes]
  boluo-cli <domain> <resource> <method> [--params <json>] [--data <json>] --json [--yes]

Arguments:
  <domain>                   OpenAPI domain, for example material or project-note
  <resource>                 OpenAPI resource; optional when the domain has one resource
  <method>                   OpenAPI operation, for example page, get, create, delete

Options:
  --params <json>            OpenAPI query parameters defined by the operation schema
  --data <json>              OpenAPI JSON requestBody defined by the operation schema
  --yes                      Confirm high-risk write APIs
  --openapi-key <key>        OpenAPI key, same as BOLUO_OPENAPI_KEY
  --openapi-endpoint <url>   OpenAPI endpoint, default https://api3.boluo-ai.com
  --json                     Print stable JSON for agents

Examples:
  boluo-cli schema material.zc-material.page
  boluo-cli material +page --search-key 海报 --page-no 1 --page-size 10 --json
  boluo-cli material page --params '{"pageNo":1,"pageSize":10}' --json
  boluo-cli project-note pj-project-note page --params '{}' --json
`;

export async function runCli(
  args = process.argv.slice(2),
  write: WriteLine = (text) => process.stdout.write(text),
  writeError: WriteLine = (text) => process.stderr.write(text),
): Promise<number> {
  const json =
    args[0] === 'schema' ||
    args.includes('--json') ||
    hasDoctorJsonFlag(args);

  try {
    const [scope, command, ...commandArgs] = args;
    if (
      scope === undefined ||
      scope === 'help' ||
      scope === '--help' ||
      scope === '-h'
    ) {
      write(HELP_TEXT);
      return 0;
    }

    if (scope === 'version' || scope === '--version' || scope === '-v') {
      write(`${VERSION}\n`);
      return 0;
    }

    if (scope === 'schema') {
      const data = await runSchemaCommand(command);
      writeJsonSuccess(write, data);
      return 0;
    }

    if (scope === 'doctor') {
      const data = await runDoctorCommand([command, ...commandArgs].filter(Boolean));
      writeJsonSuccess(write, data);
      return 0;
    }

    if (command && scope in boluoOpenApiRegistry.domains) {
      const resolvedCommand = resolveRegistryCommand(scope, command, commandArgs);
      const data = await runRegistryCommand(
        scope,
        resolvedCommand.resource,
        resolvedCommand.method,
        resolvedCommand.args,
        { parseFlatParams: resolvedCommand.parseFlatParams },
      );
      writeJsonSuccess(write, data);
      return 0;
    }

    throw new Error(`未知命令：${scope || ''}`);
  } catch (error) {
    if (json) {
      writeJsonError(writeError, error);
    } else {
      writeError(`${error instanceof Error ? error.message : String(error)}\n`);
    }
    return 1;
  }
}

function resolveRegistryCommand(
  domainName: string,
  command: string,
  commandArgs: string[],
): {
  args: string[];
  method: string | undefined;
  parseFlatParams: boolean;
  resource: string | undefined;
} {
  const domain = boluoOpenApiRegistry.domains[domainName];
  const resourceNames = Object.keys(domain.resources);
  if (command.startsWith('+') && resourceNames.length === 1) {
    return {
      args: commandArgs,
      method: command.slice(1),
      parseFlatParams: true,
      resource: resourceNames[0],
    };
  }

  const [method, ...registryArgs] = commandArgs;
  if (!method?.startsWith('--')) {
    return {
      args: registryArgs,
      method,
      parseFlatParams: false,
      resource: command,
    };
  }

  if (command === resourceNames[0]) {
    return {
      args: commandArgs,
      method: undefined,
      parseFlatParams: false,
      resource: command,
    };
  }

  if (resourceNames.length !== 1) {
    return {
      args: commandArgs,
      method: undefined,
      parseFlatParams: false,
      resource: command,
    };
  }

  return {
    args: commandArgs,
    method: command,
    parseFlatParams: false,
    resource: resourceNames[0],
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
