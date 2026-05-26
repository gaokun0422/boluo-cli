import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const materialSkillPath = path.join(repoRoot, 'skills/material/SKILL.md');
const materialReferencesPath = path.join(repoRoot, 'skills/material/references');

test('material skill uses API Resources as the top-level routing table', () => {
  const markdown = fs.readFileSync(materialSkillPath, 'utf8');

  assert.match(markdown, /^## 核心规则$/m);
  assert.match(markdown, /^## 快速决策$/m);
  assert.match(markdown, /^## API Resources$/m);
  assert.doesNotMatch(markdown, /## Shortcuts/);
  assert.doesNotMatch(markdown, /快捷命令/);
  assert.match(markdown, /必须先遵守 `boluo\.share`/);
  assert.match(markdown, /调用任何接口命令前，必须先运行对应 `boluo-cli schema <domain\.resource\.method>`/);
  assert.match(markdown, /\| API Resource \| 说明 \|/);
  assert.doesNotMatch(markdown, /\| API Resource \| 场景 \| Schema \| 风险 \|/);
  assert.match(markdown, /\[`boluo-zcMaterial-page`\]\(references\/boluo-zcMaterial-page\.md\).*schema：`material\.zc-material\.page`.*风险：只读/);
  assert.match(markdown, /\[`boluo-zcMaterial-get`\]\(references\/boluo-zcMaterial-get\.md\).*schema：`material\.zc-material\.get`.*风险：只读/);
  assert.match(markdown, /\[`boluo-zcMaterial-delete`\]\(references\/boluo-zcMaterial-delete\.md\).*schema：`material\.zc-material\.delete`.*风险：高风险/);
});

test('material API Resource references require schema before command execution', () => {
  const cases = [
    {
      file: 'boluo-zcMaterial-page.md',
      schema: 'material.zc-material.page',
      command: "boluo-cli material page --params '{}' --json",
    },
    {
      file: 'boluo-zcMaterial-get.md',
      schema: 'material.zc-material.get',
      command: "boluo-cli material get --params '{}' --json",
    },
  ];

  for (const item of cases) {
    const markdown = fs.readFileSync(
      path.join(materialReferencesPath, item.file),
      'utf8',
    );

    assert.match(markdown, new RegExp(`^# ${item.file.replace(/\.md$/, '')}$`, 'm'));
    assert.doesNotMatch(markdown, /^## 调用流程$/m);
    assert.match(markdown, /^## 常用命令$/m);
    assert.match(markdown, /^## 参数$/m);
    assert.match(markdown, /^## 行为说明$/m);
    assert.match(markdown, /# 1\. 查看参数结构/);
    assert.match(markdown, /# 2\. 调用接口命令/);
    assert.match(markdown, new RegExp(`boluo-cli schema ${item.schema.replaceAll('.', '\\.')}`));
    assert.match(markdown, new RegExp(item.command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(markdown, /schema 中不存在的参数不要传/);
  }
});
