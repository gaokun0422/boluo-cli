import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCapabilityCatalog,
  createBoluoToolName,
} from '../../src/runtime/catalog.js';

test('createBoluoToolName creates stable AI SDK-safe names', () => {
  assert.equal(
    createBoluoToolName('material.zc-material.page'),
    'material_zcMaterial_page',
  );
  assert.equal(
    createBoluoToolName('project-note.pj-project-note.page'),
    'projectNote_pjProjectNote_page',
  );
  assert.equal(
    createBoluoToolName('video-clipping.pj-video-clipping-tasks.get'),
    'videoClipping_pjVideoClippingTasks_get',
  );
});

test('buildCapabilityCatalog includes registry operations with stable metadata', () => {
  const catalog = buildCapabilityCatalog();
  const materialPage = catalog.find(
    (item) => item.ref === 'material.zc-material.page',
  );
  const materialGet = catalog.find(
    (item) => item.ref === 'material.zc-material.get',
  );

  assert.ok(materialPage);
  assert.equal(materialPage.toolName, 'material_zcMaterial_page');
  assert.equal(materialPage.domain, 'material');
  assert.equal(materialPage.resource, 'zc-material');
  assert.equal(materialPage.method, 'page');
  assert.equal(materialPage.risk, 'read');
  assert.equal(materialPage.schemaReady, true);
  assert.ok(materialPage.keywords.includes('素材库'));
  assert.ok(materialPage.keywords.includes('获得素材分页'));

  assert.ok(materialGet);
  assert.equal(materialGet.toolName, 'material_zcMaterial_get');
});

test('buildCapabilityCatalog rejects duplicate tool names', () => {
  assert.throws(
    () =>
      buildCapabilityCatalog({
        domains: {
          demo: {
            resources: {
              'foo-bar': {
                pathPrefix: '/demo/foo-bar',
                methods: {
                  get: {
                    auth: 'openapi-key',
                    httpMethod: 'GET',
                    parameters: [],
                    path: '/demo/foo-bar/get',
                    risk: 'read',
                    summary: '获得数据',
                  },
                },
              },
              fooBar: {
                pathPrefix: '/demo/fooBar',
                methods: {
                  get: {
                    auth: 'openapi-key',
                    httpMethod: 'GET',
                    parameters: [],
                    path: '/demo/fooBar/get',
                    risk: 'read',
                    summary: '获得数据',
                  },
                },
              },
            },
            sourceTag: 'demo',
            title: '演示',
          },
        },
        source: 'test',
        version: '1.0.0',
      }),
    /工具名冲突：demo_fooBar_get/,
  );
});
