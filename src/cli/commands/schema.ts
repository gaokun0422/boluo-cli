import { BoluoAgentKitError } from '../../core/errors.js';
import {
  boluoOpenApiRegistry,
  getRegistryOperation,
} from '../../registry/index.js';

function collectComponentSchemaRefs(
  value: unknown,
  refs = new Set<string>(),
): Set<string> {
  if (!value || typeof value !== 'object') {
    return refs;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectComponentSchemaRefs(item, refs);
    }
    return refs;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (
      key === '$ref' &&
      typeof nestedValue === 'string' &&
      nestedValue.startsWith('#/components/schemas/')
    ) {
      refs.add(nestedValue);
      continue;
    }

    collectComponentSchemaRefs(nestedValue, refs);
  }

  return refs;
}

export async function runSchemaCommand(
  ref: string | undefined,
): Promise<unknown> {
  if (ref === undefined) {
    throw new BoluoAgentKitError(
      'INVALID_INPUT',
      '缺少接口引用，例如 material.zc-material.page',
    );
  }

  const result = getRegistryOperation(ref);
  if (result === undefined) {
    throw new BoluoAgentKitError(
      'SCHEMA_NOT_FOUND',
      `未找到接口 schema：${ref}`,
    );
  }

  const domainDefinition = boluoOpenApiRegistry.domains[result.domain];
  const operation =
    domainDefinition?.resources[result.resource]?.methods[result.method];

  const unresolvedRequestBodyRefs = collectComponentSchemaRefs(
    operation?.requestBody,
  );
  if (unresolvedRequestBodyRefs.size > 0) {
    throw new BoluoAgentKitError(
      'SCHEMA_UNRESOLVED_REFS',
      `接口 schema 包含无法解析的引用：${result.ref}`,
    );
  }

  return {
    ref: result.ref,
    domain: {
      title: domainDefinition.title,
      tag: domainDefinition.sourceTag,
    },
    operation,
  };
}
