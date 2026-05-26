import registryJson from './generated/boluo-openapi.json' with { type: 'json' };

import type { BoluoOpenApiRegistry } from './types.js';

export const boluoOpenApiRegistry =
  registryJson as BoluoOpenApiRegistry;

export interface ParsedOperationRef {
  domain: string;
  method: string;
  resource: string;
}

export interface RegistryOperationRef extends ParsedOperationRef {
  ref: string;
}

export function parseOperationRef(value: string): ParsedOperationRef {
  const parts = value.split('.');
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    throw new Error(`接口引用格式错误：${value}`);
  }

  const [domain, resource, method] = parts;
  return { domain, resource, method };
}

export function getRegistryOperation(
  value: string,
): RegistryOperationRef | undefined {
  const { domain, resource, method } = parseOperationRef(value);
  const domainDefinition = boluoOpenApiRegistry.domains[domain];
  const operation =
    domainDefinition?.resources[resource]?.methods[method];

  if (!domainDefinition || !operation) {
    return undefined;
  }

  return {
    ref: value,
    domain,
    resource,
    method,
  };
}
