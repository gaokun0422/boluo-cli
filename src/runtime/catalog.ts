import {
  boluoOpenApiRegistry,
  parseOperationRef,
} from '../registry/index.js';
import type {
  BoluoOpenApiRegistry,
  RegistryMethod,
  RegistryRisk,
} from '../registry/types.js';

export type BoluoCapability = {
  // registry 中的业务域名，例如 material。
  domain: string;
  // 真实接口方法、路径和风险等级都来自 registry，运行时只透传不猜测。
  httpMethod: RegistryMethod['httpMethod'];
  // 用于运行时检索能力的关键词集合。
  keywords: string[];
  method: string;
  path: string;
  // registry operation 的稳定引用，格式为 domain.resource.method。
  ref: string;
  resource: string;
  risk: RegistryRisk;
  // schema 未就绪的能力不会暴露给 AI SDK tool。
  schemaReady: boolean;
  sourceTag: string;
  summary?: string;
  title: string;
  // 暴露给模型调用的 AI SDK tool 名称。
  toolName: string;
  // 面向模型的工具使用说明，会影响模型选工具的倾向。
  usage: string;
};

export function createBoluoToolName(ref: string): string {
  // toolName 由 operation ref 派生，保持与 registry 引用一一对应。
  const { domain, resource, method } = parseOperationRef(ref);
  return [domain, resource, method].map(toCamelName).join('_');
}

export function buildCapabilityCatalog(
  registry: BoluoOpenApiRegistry = boluoOpenApiRegistry,
): BoluoCapability[] {
  const catalog: BoluoCapability[] = [];
  const toolNames = new Set<string>();

  // Catalog 直接以 registry 为事实来源，避免在运行时猜接口路径或字段契约。
  for (const [domainName, domain] of Object.entries(registry.domains)) {
    // 按 domain -> resource -> method 遍历，保持和 OpenAPI registry 的层级一致。
    for (const [resourceName, resource] of Object.entries(domain.resources)) {
      for (const [methodName, method] of Object.entries(resource.methods)) {
        const ref = `${domainName}.${resourceName}.${methodName}`;
        const toolName = createBoluoToolName(ref);

        // toolName 是模型调用入口，冲突时必须立即失败，不能静默覆盖。
        if (toolNames.has(toolName)) {
          throw new Error(`工具名冲突：${toolName}`);
        }
        toolNames.add(toolName);

        // 每个 capability 都保留 registry 的原始契约信息，供 AI SDK 层和执行层共用。
        catalog.push({
          domain: domainName,
          httpMethod: method.httpMethod,
          keywords: buildKeywords(
            domain.title,
            resourceName,
            methodName,
            method.summary,
          ),
          method: methodName,
          path: method.path,
          ref,
          resource: resourceName,
          risk: method.risk,
          schemaReady: isSchemaReady(method),
          sourceTag: domain.sourceTag,
          summary: method.summary,
          title: domain.title,
          toolName,
          usage: method.summary || `${domain.title} ${resourceName} ${methodName}`,
        });
      }
    }
  }

  return catalog;
}

function toCamelName(value: string): string {
  // 将 ref 片段统一转换为 camelCase，再由 createBoluoToolName 拼接成工具名。
  return value
    .split(/[-_\s/]+/)
    .filter(Boolean)
    .map((part, index) =>
      index === 0
        ? part.charAt(0).toLowerCase() + part.slice(1)
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('');
}

function buildKeywords(...values: Array<string | undefined>): string[] {
  // 关键词既保留完整短语，也拆分短词，兼顾精确匹配和简单文本检索。
  const keywords = new Set<string>();

  for (const value of values) {
    if (!value) {
      continue;
    }
    keywords.add(value);
    for (const part of value.split(/[-_\s/]+/).filter(Boolean)) {
      keywords.add(part);
    }
  }

  return [...keywords];
}

function isSchemaReady(method: RegistryMethod): boolean {
  // 含 $ref 的 schema 需要先解析引用后才能稳定暴露给 AI SDK tool。
  return (
    method.parameters.every((parameter) => !containsRef(parameter.schema)) &&
    !containsRef(method.requestBody)
  );
}

function containsRef(value: unknown): boolean {
  // 递归检查 schema 任意层级是否含 $ref，避免把未展开结构交给模型调用。
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(value, '$ref')) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsRef(item));
  }

  return Object.values(value).some((item) => containsRef(item));
}
