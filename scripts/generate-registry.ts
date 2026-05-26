import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  BoluoOpenApiRegistry,
  RegistryMethod,
  RegistryParameter,
  RegistryRisk,
} from '../src/registry/types.js';

const SUPPORTED_HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

type SupportedHttpMethod = (typeof SUPPORTED_HTTP_METHODS)[number];

export interface OpenApiParameter {
  description?: string;
  in: string;
  name: string;
  required?: boolean;
  schema?: unknown;
}

export interface OpenApiOperation {
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: unknown;
  responses?: unknown;
  summary?: string;
  tags?: string[];
}

export interface OpenApiPathItem {
  delete?: OpenApiOperation;
  get?: OpenApiOperation;
  patch?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
}

export interface OpenApiDocument {
  info?: {
    version?: string;
  };
  openapi?: string;
  paths: Record<string, OpenApiPathItem>;
}

interface TagMapping {
  domain: string;
  title: string;
}

interface RegistryOverrides {
  riskOverrides: Record<string, RegistryRisk>;
  source: string;
  tagMappings: Record<string, TagMapping>;
}

export function generateRegistryFromOpenApi(
  document: OpenApiDocument,
  overrides: RegistryOverrides,
): BoluoOpenApiRegistry {
  const registry: BoluoOpenApiRegistry = {
    domains: {},
    source: overrides.source,
    version: document.info?.version ?? '1.0.0',
  };

  for (const [operationPath, pathItem] of Object.entries(document.paths)) {
    for (const httpMethod of SUPPORTED_HTTP_METHODS) {
      const operation = pathItem[httpMethod];
      if (!operation) {
        continue;
      }

      const sourceTag = operation.tags?.[0];
      if (!sourceTag) {
        continue;
      }

      const mapping = overrides.tagMappings[sourceTag];
      if (!mapping) {
        continue;
      }

      const domain =
        registry.domains[mapping.domain] ??
        (registry.domains[mapping.domain] = {
          resources: {},
          sourceTag,
          title: mapping.title,
        });
      const resourceName = getResourceName(operationPath);
      const methodName = getMethodName(operationPath);
      const resource =
        domain.resources[resourceName] ??
        (domain.resources[resourceName] = {
          methods: {},
          pathPrefix: operationPath.slice(0, -methodName.length - 1),
        });

      resource.methods[methodName] = {
        auth: 'openapi-key',
        httpMethod: httpMethod.toUpperCase() as RegistryMethod['httpMethod'],
        operationId: operation.operationId,
        parameters: getRegistryParameters(operation.parameters),
        path: operationPath,
        requestBody: operation.requestBody,
        response: operation.responses,
        risk: getRisk(operationPath, httpMethod, overrides.riskOverrides),
        summary: operation.summary,
      };
    }
  }

  return sortObject(registry) as BoluoOpenApiRegistry;
}

function getResourceName(operationPath: string): string {
  const segments = operationPath.split('/').filter(Boolean);
  return segments.at(-2) ?? segments.at(-1) ?? operationPath;
}

function getMethodName(operationPath: string): string {
  const segments = operationPath.split('/').filter(Boolean);
  return segments.at(-1) ?? operationPath;
}

function getRegistryParameters(
  parameters: OpenApiParameter[] | undefined,
): RegistryParameter[] {
  return (parameters ?? [])
    .filter((parameter) => parameter.in !== 'header')
    .map((parameter) => ({
      description: parameter.description,
      in: parameter.in,
      name: parameter.name,
      required: parameter.required ?? false,
      schema: parameter.schema,
    }));
}

function getRisk(
  operationPath: string,
  httpMethod: SupportedHttpMethod,
  riskOverrides: Record<string, RegistryRisk>,
): RegistryRisk {
  return (
    riskOverrides[`${httpMethod.toUpperCase()} ${operationPath}`] ??
    (httpMethod === 'get'
      ? 'read'
      : httpMethod === 'delete'
        ? 'high-risk-write'
        : 'write')
  );
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => [key, sortObject(entryValue)]),
  );
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const [documentContent, overridesContent] = await Promise.all([
    readFile(path.join(repoRoot, 'openapi', 'boluo-openapi.json'), 'utf8'),
    readFile(path.join(repoRoot, 'openapi', 'overrides.json'), 'utf8'),
  ]);
  const registry = generateRegistryFromOpenApi(
    JSON.parse(documentContent) as OpenApiDocument,
    JSON.parse(overridesContent) as RegistryOverrides,
  );
  const outputPath = path.join(
    repoRoot,
    'src',
    'registry',
    'generated',
    'boluo-openapi.json',
  );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(registry, null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
