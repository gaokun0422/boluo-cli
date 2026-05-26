import assert from 'node:assert/strict';
import test from 'node:test';

import { createBoluoAiSdkRuntime } from '../../src/ai-sdk/index.js';

test('createBoluoAiSdkRuntime exposes all schema-ready tools when authenticated', () => {
  const runtime = createBoluoAiSdkRuntime({
    auth: { openApiKey: 'openapi-key' },
  });

  assert.ok(runtime.tools.material_zcMaterial_page);
  assert.ok(runtime.tools.material_zcMaterial_delete);
});

test('createBoluoAiSdkRuntime keeps business tools unavailable without auth', () => {
  const runtime = createBoluoAiSdkRuntime({});

  assert.deepEqual(Object.keys(runtime.tools), []);
});

test('createBoluoAiSdkRuntime only builds business tools with ready schemas', () => {
  const runtime = createBoluoAiSdkRuntime({
    auth: { openApiKey: 'openapi-key' },
  });

  assert.ok(runtime.tools.material_zcMaterial_page);
  assert.equal(runtime.tools.material_zcMaterial_create, undefined);
});

test('createBoluoAiSdkRuntime exposes stable tool set for same auth', () => {
  const first = createBoluoAiSdkRuntime({
    auth: { openApiKey: 'openapi-key' },
  });
  const second = createBoluoAiSdkRuntime({
    auth: { openApiKey: 'openapi-key' },
  });

  assert.deepEqual(Object.keys(first.tools).sort(), Object.keys(second.tools).sort());
  assert.ok(first.tools.material_zcMaterial_page);
  assert.ok(first.tools.material_zcMaterial_delete);
});
