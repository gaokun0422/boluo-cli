import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { validateSkills } from '../../scripts/validate-skills.js';

const repoRoot = process.cwd();

test('validateSkills accepts material API Resource references', () => {
  const result = validateSkills(path.join(repoRoot, 'skills'));

  assert.deepEqual(result.errors, []);
});

test('validateSkills reports generated API resource files as stale output', () => {
  const tempRoot = fs.mkdtempSync(path.join(repoRoot, 'dist-test/stale-skills-'));
  const skillRoot = path.join(tempRoot, 'demo');
  fs.mkdirSync(skillRoot, { recursive: true });
  fs.writeFileSync(path.join(skillRoot, 'api-resources.generated.md'), '# stale\n');

  const result = validateSkills(tempRoot);

  assert.deepEqual(result.errors, [
    'demo/api-resources.generated.md 已废弃，请改用 references/boluo-<接口模块驼峰>-<功能驼峰>.md',
  ]);
});

test('validateSkills reports missing schema and command in an API Resource reference', () => {
  const tempRoot = fs.mkdtempSync(path.join(repoRoot, 'dist-test/skills-'));
  const skillRoot = path.join(tempRoot, 'demo');
  const referencesRoot = path.join(skillRoot, 'references');
  fs.mkdirSync(referencesRoot, { recursive: true });
  fs.writeFileSync(
    path.join(skillRoot, 'SKILL.md'),
    [
      '# Demo',
      '',
      '## API Resources',
      '',
      '| API Resource | 场景 | Schema | 风险 |',
      '| --- | --- | --- | --- |',
      '| [`boluo-demoResource-broken`](references/boluo-demoResource-broken.md) | 测试 | `demo.resource.method` | 只读 |',
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(referencesRoot, 'boluo-demoResource-broken.md'),
    ['# boluo-demoResource-broken', '', '## 调用流程', ''].join('\n'),
  );

  const result = validateSkills(tempRoot);

  assert.deepEqual(result.errors, [
    'demo/references/boluo-demoResource-broken.md 缺少 schema 命令：boluo-cli schema demo.resource.method',
    'demo/references/boluo-demoResource-broken.md 缺少接口调用命令',
  ]);
});
