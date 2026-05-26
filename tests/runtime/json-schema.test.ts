import assert from 'node:assert/strict';
import test from 'node:test';

import { getRuntimeInputJsonSchema } from '../../src/runtime/json-schema.js';

test('getRuntimeInputJsonSchema builds query parameter object schema for GET', () => {
  const schema = getRuntimeInputJsonSchema('material.zc-material.page');

  assert.equal(schema.type, 'object');
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties?.pageNo?.type, 'integer');
  assert.equal(schema.properties?.pageSize?.type, 'integer');
  assert.equal(schema.properties?.searchKey?.type, 'string');
  assert.deepEqual(schema.properties?.sortField?.enum, [
    'recommended',
    'create_time',
    'update_time',
    'name',
    'size',
    'duration',
  ]);
  assert.match(String(schema.properties?.sortField?.description), /排序字段/);
  assert.equal(schema.properties?.mtypeList?.type, 'array');
  assert.equal(schema.properties?.mtypeList?.items?.type, 'string');
});

test('getRuntimeInputJsonSchema requires required registry parameters', () => {
  const schema = getRuntimeInputJsonSchema('material.zc-material.get');

  assert.deepEqual(schema.required, ['id']);
  assert.equal(schema.properties?.id?.type, 'integer');
});

test('getRuntimeInputJsonSchema rejects unresolved request body refs', () => {
  assert.throws(
    () => getRuntimeInputJsonSchema('material.zc-material.create'),
    /接口 schema 包含无法解析的引用：material.zc-material.create/,
  );
});

test('getRuntimeInputJsonSchema throws for missing operation ref', () => {
  assert.throws(
    () => getRuntimeInputJsonSchema('material.zc-material.nope'),
    /未找到接口 schema：material.zc-material.nope/,
  );
});
