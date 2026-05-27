import assert from 'node:assert/strict';
import test from 'node:test';

import type { RegistryDomain } from '../../src/registry/types.js';
import {
  getApiResourceFileName,
  replaceDomainSkillApiResources,
  renderApiResourceReference,
  renderDomainSkill,
  renderDomainSkillApiResources,
} from '../../scripts/generate-skills.js';

test('renderDomainSkillApiResources renders a top-level API Resources table for a domain', () => {
  const domain: RegistryDomain = {
    sourceTag: 'OpenAPI - 素材库',
    title: '素材库',
    resources: {
      'aa-folder': {
        pathPrefix: '/app-api/boluo/open-api/aa-folder',
        methods: {
          list: {
            auth: 'openapi-key',
            httpMethod: 'GET',
            operationId: 'listFolders',
            parameters: [],
            path: '/app-api/boluo/open-api/aa-folder/list',
            risk: 'read',
            summary: '素材|文件夹\n列表',
          },
        },
      },
      'zc-material': {
        pathPrefix: '/app-api/boluo/open-api/zc-material',
        methods: {
          create: {
            auth: 'openapi-key',
            httpMethod: 'POST',
            operationId: 'createMaterial',
            parameters: [],
            path: '/app-api/boluo/open-api/zc-material/create',
            risk: 'write',
            summary: '创建素材',
          },
          page: {
            auth: 'openapi-key',
            httpMethod: 'GET',
            operationId: 'pageMaterial',
            parameters: [],
            path: '/app-api/boluo/open-api/zc-material/page',
            risk: 'read',
            summary: '获得素材分页',
          },
        },
      },
    },
  };

  const markdown = renderDomainSkillApiResources('material', domain);

  assert.ok(markdown.includes('## API Resources'));
  assert.ok(markdown.includes('每次调用前必须先执行对应 schema 命令确认参数结构。'));
  assert.equal(markdown.includes('shortcut'), false);
  assert.ok(
    markdown.includes(
      '| [`boluo-aaFolder-list`](references/boluo-aaFolder-list.md) | 素材\\|文件夹<br>列表；schema：`material.aa-folder.list`；风险：只读 |',
    ),
  );
  assert.ok(
    markdown.includes(
      '| [`boluo-zcMaterial-create`](references/boluo-zcMaterial-create.md) | 创建素材；schema：`material.zc-material.create`；风险：写入 |',
    ),
  );
  assert.ok(markdown.includes('| API Resource | 说明 |'));
  assert.equal(markdown.includes('| API Resource | 场景 | Schema | 风险 |'), false);
  assert.ok(markdown.indexOf('[`boluo-aaFolder-list`](references/boluo-aaFolder-list.md)') < markdown.indexOf('[`boluo-zcMaterial-create`](references/boluo-zcMaterial-create.md)'));
  assert.ok(markdown.indexOf('[`boluo-zcMaterial-create`](references/boluo-zcMaterial-create.md)') < markdown.indexOf('[`boluo-zcMaterial-page`](references/boluo-zcMaterial-page.md)'));
});

test('renderApiResourceReference renders one operation document with schema-first flow', () => {
  const markdown = renderApiResourceReference('material', 'zc-material', 'page', {
    auth: 'openapi-key',
    httpMethod: 'GET',
    operationId: 'pageMaterial',
    parameters: [
      {
        description: '搜索关键词',
        in: 'query',
        name: 'searchKey',
        required: false,
        schema: { type: 'string' },
      },
    ],
    path: '/app-api/boluo/open-api/zc-material/page',
    risk: 'read',
    summary: '获得素材分页',
  });

  assert.ok(markdown.includes('# boluo-zcMaterial-page'));
  assert.equal(markdown.includes('## 调用流程'), false);
  assert.ok(markdown.includes('## 常用命令'));
  assert.ok(markdown.includes('# 1. 查看参数结构'));
  assert.ok(markdown.includes('boluo-cli schema material.zc-material.page'));
  assert.ok(markdown.includes('# 2. 调用接口命令'));
  assert.ok(markdown.includes("boluo-cli material zc-material page --params '{}' --json"));
  assert.ok(markdown.includes('| `searchKey` | query | 否 | `string` | 搜索关键词 |'));
  assert.ok(markdown.includes('- HTTP：`GET /app-api/boluo/open-api/zc-material/page`'));
  assert.ok(markdown.includes('- schema 中不存在的参数不要传。'));
});

test('renderApiResourceReference can render a short command for single-resource domains', () => {
  const markdown = renderApiResourceReference(
    'material',
    'zc-material',
    'page',
    {
      auth: 'openapi-key',
      httpMethod: 'GET',
      parameters: [],
      path: '/app-api/boluo/open-api/zc-material/page',
      risk: 'read',
    },
    undefined,
    true,
  );

  assert.ok(markdown.includes('boluo-cli material page --json'));
});

test('renderApiResourceReference uses schema parameter positions in command examples', () => {
  const markdown = renderApiResourceReference(
    'material',
    'zc-material',
    'delete',
    {
      auth: 'openapi-key',
      httpMethod: 'DELETE',
      parameters: [
        {
          description: '编号',
          in: 'query',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      path: '/app-api/boluo/open-api/zc-material/delete',
      risk: 'high-risk-write',
    },
    undefined,
    true,
  );

  assert.ok(markdown.includes('boluo-cli material delete --params \'{"id":123}\' --yes --json'));
  assert.equal(markdown.includes("delete --data '{}'"), false);
});

test('renderApiResourceReference includes request body flag only when schema declares requestBody', () => {
  const markdown = renderApiResourceReference('material', 'zc-material', 'create', {
    auth: 'openapi-key',
    httpMethod: 'POST',
    parameters: [],
    path: '/app-api/boluo/open-api/zc-material/create',
    requestBody: {
      content: {
        'application/json': {
          schema: { type: 'object' },
        },
      },
      required: true,
    },
    risk: 'write',
  });

  assert.ok(markdown.includes("boluo-cli material zc-material create --data '{}' --json"));
  assert.equal(markdown.includes('--params'), false);
});

test('getApiResourceFileName uses project, module, resource, and method', () => {
  assert.equal(
    getApiResourceFileName('zc-material', 'page'),
    'boluo-zcMaterial-page.md',
  );
  assert.equal(
    getApiResourceFileName('pj-project-note-config', 'get-by-project-id'),
    'boluo-pjProjectNoteConfig-getByProjectId.md',
  );
});

test('replaceDomainSkillApiResources preserves manual content and replaces API Resources section', () => {
  const markdown = [
    '---',
    'name: boluo.material',
    'version: 1.0.0',
    'description: demo',
    '---',
    '',
    '# 菠萝素材库',
    '',
    '## 核心规则',
    '',
    '- 人工规则',
    '',
    '## API Resources',
    '',
    '| old | old |',
    '| --- | --- |',
    '| stale | stale |',
    '',
  ].join('\n');

  const result = replaceDomainSkillApiResources(markdown, '## API Resources\n\n| API Resource | 说明 |\n');

  assert.ok(result.includes('- 人工规则'));
  assert.ok(result.includes('version: 1.0.0'));
  assert.ok(result.includes('| API Resource | 说明 |'));
  assert.equal(result.includes('| stale | stale |'), false);
  assert.equal(result.endsWith('\n'), true);
});

test('renderDomainSkill creates a full top-level skill for a domain without manual SKILL.md', () => {
  const domain: RegistryDomain = {
    sourceTag: 'OpenAPI - 图文批量生成',
    title: '图文批量生成',
    resources: {
      'pj-project-note': {
        pathPrefix: '/app-api/boluo/open-api/pj-project-note',
        methods: {
          create: {
            auth: 'openapi-key',
            httpMethod: 'POST',
            operationId: 'createProjectNote',
            parameters: [],
            path: '/app-api/boluo/open-api/pj-project-note/create',
            risk: 'write',
            summary: '创建工程-批量生成-图文/脚本',
          },
        },
      },
    },
  };

  const markdown = renderDomainSkill('project-note', domain);

  assert.ok(markdown.includes('name: boluo.project-note'));
  assert.ok(markdown.includes('version: 1.0.0'));
  assert.ok(markdown.includes('description: 当用户需要使用菠萝平台图文批量生成能力'));
  assert.ok(markdown.includes('## 核心规则'));
  assert.ok(markdown.includes('- 必须先遵守 `boluo.share`。'));
  assert.ok(markdown.includes('## 快速决策'));
  assert.ok(markdown.includes('## API Resources'));
  assert.ok(markdown.includes('[`boluo-pjProjectNote-create`](references/boluo-pjProjectNote-create.md)'));
});
