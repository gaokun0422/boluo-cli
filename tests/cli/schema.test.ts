import assert from 'node:assert/strict';
import test from 'node:test';

import { runCli } from '../../src/cli/index.js';

test('CLI schema prints a registry operation JSON envelope', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['schema', 'material.zc-material.page'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  const result = JSON.parse(output.join(''));
  assert.equal(exitCode, 0);
  assert.equal(result.ok, true);
  assert.equal(result.data.ref, 'material.zc-material.page');
  assert.equal(result.data.operation.summary, '获得素材分页');
  assert.equal(result.data.operation.httpMethod, 'GET');
});

test('CLI schema rejects unresolved request body refs', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['schema', 'material.zc-material.create'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  assert.equal(exitCode, 1);
  assert.deepEqual(JSON.parse(output.join('')), {
    ok: false,
    error: {
      code: 'SCHEMA_UNRESOLVED_REFS',
      message: '接口 schema 包含无法解析的引用：material.zc-material.create',
    },
  });
});

test('CLI schema prints JSON error when registry operation is missing', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['schema', 'material.zc-material.nope'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  assert.equal(exitCode, 1);
  assert.deepEqual(JSON.parse(output.join('')), {
    ok: false,
    error: {
      code: 'SCHEMA_NOT_FOUND',
      message: '未找到接口 schema：material.zc-material.nope',
    },
  });
});
