import {
  boluoOpenApiRegistry,
  getRegistryOperation,
} from '../registry/index.js';
import type { RegistryParameter } from '../registry/types.js';

export type RuntimeJsonSchema = {
  additionalProperties?: boolean;
  description?: string;
  enum?: Array<boolean | null | number | string>;
  format?: string;
  maximum?: number;
  minimum?: number;
  properties?: Record<string, RuntimeJsonSchema>;
  required?: string[];
  items?: RuntimeJsonSchema;
  type?: 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string';
};

const JSON_SCHEMA_TYPES = new Set([
  'array',
  'boolean',
  'integer',
  'number',
  'object',
  'string',
]);

export function getRuntimeInputJsonSchema(ref: string): RuntimeJsonSchema {
  const operationRef = getRegistryOperation(ref);
  if (!operationRef) {
    throw new Error(`未找到接口 schema：${ref}`);
  }

  const operation =
    boluoOpenApiRegistry.domains[operationRef.domain].resources[
      operationRef.resource
    ].methods[operationRef.method];

  if (operation.httpMethod === 'GET' || !operation.requestBody) {
    return parametersToSchema(operation.parameters);
  }

  // runtime 不能把未展开的 $ref 暴露成 AI tool schema，否则会生成错误输入契约。
  if (hasUnresolvedComponentSchemaRef(operation.requestBody)) {
    throw new Error(`接口 schema 包含无法解析的引用：${ref}`);
  }

  return toRuntimeJsonSchema(getRequestBodyJsonSchema(operation.requestBody));
}

function parametersToSchema(
  parameters: RegistryParameter[],
): RuntimeJsonSchema {
  const properties: Record<string, RuntimeJsonSchema> = {};
  const required: string[] = [];

  // GET 参数在 runtime 侧统一收敛成 tool input object，边界上不猜路径或额外字段。
  for (const parameter of parameters) {
    const property = toRuntimeJsonSchema(parameter.schema);
    if (!property.description && parameter.description) {
      property.description = parameter.description;
    }
    properties[parameter.name] = property;

    if (parameter.required) {
      required.push(parameter.name);
    }
  }

  return {
    type: 'object',
    additionalProperties: false,
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

function toRuntimeJsonSchema(value: unknown): RuntimeJsonSchema {
  if (!isRecord(value)) {
    return { type: 'string' };
  }

  const schema: RuntimeJsonSchema = {};

  // 只复制 registry 已有且 runtime 明确支持的 JSON schema 字段，避免扩展未知契约。
  if (isRuntimeJsonSchemaType(value.type)) {
    schema.type = value.type;
  }
  if (typeof value.description === 'string') {
    schema.description = value.description;
  }
  if (typeof value.format === 'string') {
    schema.format = value.format;
  }
  if (typeof value.maximum === 'number') {
    schema.maximum = value.maximum;
  }
  if (typeof value.minimum === 'number') {
    schema.minimum = value.minimum;
  }
  if (Array.isArray(value.enum) && value.enum.every(isRuntimeEnumValue)) {
    schema.enum = value.enum;
  }
  if (Array.isArray(value.required)) {
    const required = value.required.filter(
      (item): item is string => typeof item === 'string',
    );
    if (required.length > 0) {
      schema.required = required;
    }
  }
  if (isRecord(value.properties)) {
    schema.properties = Object.fromEntries(
      Object.entries(value.properties).map(([key, property]) => [
        key,
        toRuntimeJsonSchema(property),
      ]),
    );
  }
  if (value.items) {
    schema.items = toRuntimeJsonSchema(value.items);
  }
  if (schema.type === 'object') {
    schema.additionalProperties = false;
  }

  return Object.keys(schema).length > 0 ? schema : { type: 'string' };
}

function getRequestBodyJsonSchema(requestBody: unknown): unknown {
  if (!isRecord(requestBody) || !isRecord(requestBody.content)) {
    return undefined;
  }

  const jsonContent = requestBody.content['application/json'];
  if (!isRecord(jsonContent)) {
    return undefined;
  }

  return jsonContent.schema;
}

function hasUnresolvedComponentSchemaRef(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasUnresolvedComponentSchemaRef(item));
  }

  return Object.entries(value).some(
    ([key, nestedValue]) =>
      (key === '$ref' &&
        typeof nestedValue === 'string' &&
        nestedValue.startsWith('#/components/schemas/')) ||
      hasUnresolvedComponentSchemaRef(nestedValue),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isRuntimeJsonSchemaType(
  value: unknown,
): value is NonNullable<RuntimeJsonSchema['type']> {
  return typeof value === 'string' && JSON_SCHEMA_TYPES.has(value);
}

function isRuntimeEnumValue(
  value: unknown,
): value is boolean | null | number | string {
  return (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  );
}
