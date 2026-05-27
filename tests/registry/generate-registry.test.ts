import assert from 'node:assert/strict';
import test from 'node:test';

import { generateRegistryFromOpenApi } from '../../scripts/generate-registry.js';

test('generateRegistryFromOpenApi maps material operations into registry resources', () => {
  const document = {
    info: {
      version: '1.0.0',
    },
    openapi: '3.0.1',
    paths: {
      '/app-api/boluo/open-api/zc-material/create': {
        post: {
          operationId: 'createMaterial',
          parameters: [
            {
              in: 'header',
              name: 'tenant-id',
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  properties: {
                    name: { type: 'string' },
                  },
                  required: ['name'],
                  type: 'object',
                },
              },
            },
            required: true,
          },
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {
                    properties: {
                      code: { type: 'integer' },
                      data: {
                        properties: {
                          id: { format: 'int64', type: 'integer' },
                        },
                        type: 'object',
                      },
                    },
                    type: 'object',
                  },
                },
              },
              description: 'OK',
            },
          },
          summary: '创建素材',
          tags: ['OpenAPI - 素材库'],
        },
      },
      '/app-api/boluo/open-api/zc-material/page': {
        get: {
          operationId: 'pageMaterial',
          parameters: [
            {
              in: 'header',
              name: 'tenant-id',
              schema: { type: 'string' },
            },
            {
              description: '搜索关键词',
              in: 'query',
              name: 'searchKey',
              required: false,
              schema: { type: 'string' },
            },
          ],
          summary: '分页查询素材',
          tags: ['OpenAPI - 素材库'],
        },
      },
      '/app-api/boluo/open-api/zc-material/delete': {
        delete: {
          operationId: 'deleteMaterial',
          parameters: [
            {
              in: 'query',
              name: 'id',
              required: true,
              schema: { format: 'int64', type: 'integer' },
            },
          ],
          summary: '删除素材',
          tags: ['OpenAPI - 素材库'],
        },
      },
    },
  };
  const registry = generateRegistryFromOpenApi(
    document,
    {
      riskOverrides: {},
      source: 'https://api3.boluo-ai.com/v3/api-docs/boluo-openapi',
      tagMappings: {
        'OpenAPI - 素材库': {
          domain: 'material',
          title: '素材库',
        },
      },
    },
  );

  assert.equal(
    registry.source,
    'https://api3.boluo-ai.com/v3/api-docs/boluo-openapi',
  );
  assert.equal(registry.version, '1.0.0');
  assert.equal(registry.domains.material.title, '素材库');

  const materialResource = registry.domains.material.resources['zc-material'];
  assert.equal(materialResource.pathPrefix, '/app-api/boluo/open-api/zc-material');

  const pageMethod = materialResource.methods.page;
  assert.equal(pageMethod.httpMethod, 'GET');
  assert.equal(pageMethod.auth, 'openapi-key');
  assert.equal(pageMethod.risk, 'read');
  assert.deepEqual(pageMethod.parameters, [
    {
      description: '搜索关键词',
      in: 'query',
      name: 'searchKey',
      required: false,
      schema: { type: 'string' },
    },
  ]);

  assert.equal(materialResource.methods.create.httpMethod, 'POST');
  assert.equal(materialResource.methods.create.risk, 'write');
  assert.equal(materialResource.methods.delete.httpMethod, 'DELETE');
  assert.equal(materialResource.methods.delete.risk, 'high-risk-write');
  assert.deepEqual(materialResource.methods.create.requestBody, {
    content: {
      'application/json': {
        schema: {
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
          type: 'object',
        },
      },
    },
    required: true,
  });
  assert.deepEqual(materialResource.methods.create.response, {
    '200': {
      content: {
        'application/json': {
          schema: {
            properties: {
              code: { type: 'integer' },
              data: {
                properties: {
                  id: { format: 'int64', type: 'integer' },
                },
                type: 'object',
              },
            },
            type: 'object',
          },
        },
      },
      description: 'OK',
    },
  });
});

test('generateRegistryFromOpenApi keeps risk overrides above default HTTP method risk', () => {
  const document = {
    paths: {
      '/app-api/boluo/open-api/zc-material/delete': {
        delete: {
          operationId: 'deleteMaterial',
          tags: ['OpenAPI - 素材库'],
        },
      },
    },
  };
  const registry = generateRegistryFromOpenApi(
    document,
    {
      riskOverrides: {
        'DELETE /app-api/boluo/open-api/zc-material/delete': 'write',
      },
      source: 'https://api3.boluo-ai.com/v3/api-docs/boluo-openapi',
      tagMappings: {
        'OpenAPI - 素材库': {
          domain: 'material',
          title: '素材库',
        },
      },
    },
  );

  assert.equal(
    registry.domains.material.resources['zc-material'].methods.delete.risk,
    'write',
  );
});
