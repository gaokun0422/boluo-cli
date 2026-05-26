export type RegistryRisk = 'read' | 'write' | 'high-risk-write';

export interface RegistryParameter {
  description?: string;
  in: string;
  name: string;
  required: boolean;
  schema?: unknown;
}

export interface RegistryMethod {
  auth: 'openapi-key';
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  operationId?: string;
  parameters: RegistryParameter[];
  path: string;
  requestBody?: unknown;
  response?: unknown;
  risk: RegistryRisk;
  summary?: string;
}

export interface RegistryResource {
  methods: Record<string, RegistryMethod>;
  pathPrefix: string;
}

export interface RegistryDomain {
  resources: Record<string, RegistryResource>;
  sourceTag: string;
  title: string;
}

export interface BoluoOpenApiRegistry {
  domains: Record<string, RegistryDomain>;
  source: string;
  version: string;
}
