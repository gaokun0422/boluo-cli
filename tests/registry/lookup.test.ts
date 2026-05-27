import assert from 'node:assert/strict';
import test from 'node:test';

import {
  boluoOpenApiRegistry,
  getRegistryOperation,
} from '../../src/registry/index.js';

test('getRegistryOperation resolves a material operation ref', () => {
  const operation = getRegistryOperation('material.zc-material.page');

  assert.ok(operation);
  assert.equal(operation.ref, 'material.zc-material.page');
  assert.equal(operation.domain, 'material');
  assert.equal(operation.resource, 'zc-material');
  assert.equal(operation.method, 'page');
  assert.deepEqual(Object.keys(operation).sort(), [
    'domain',
    'method',
    'ref',
    'resource',
  ]);

  const method =
    boluoOpenApiRegistry.domains[operation.domain]?.resources[operation.resource]
      ?.methods[operation.method];
  assert.ok(method);
  assert.equal(method.operationId, 'getZcMaterialPage');
  assert.equal(method.httpMethod, 'GET');
  assert.equal(
    method.path,
    '/app-api/boluo/open-api/zc-material/page',
  );
});

test('getRegistryOperation returns undefined for a missing operation ref', () => {
  assert.equal(
    getRegistryOperation('material.zc-material.nope'),
    undefined,
  );
});
