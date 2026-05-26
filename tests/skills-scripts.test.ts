import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { normalizeGeneratedMarkdown } from '../scripts/generate-skills.js';
import { normalizeSkillMarkdownFiles } from '../scripts/generate-skills.js';
import { validateSkills } from '../scripts/validate-skills.js';

test('normalizeGeneratedMarkdown removes a leading UTF-8 BOM', () => {
  assert.equal(
    normalizeGeneratedMarkdown('\uFEFF---\nname: boluo.material\n---\n'),
    '---\nname: boluo.material\n---\n',
  );
});

test('validateSkills reports SKILL.md files that start with a BOM', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'boluo-skills-'));
  try {
    const skillRoot = path.join(tempRoot, 'skills');
    const domainRoot = path.join(skillRoot, 'material');
    fs.mkdirSync(domainRoot, { recursive: true });
    fs.writeFileSync(
      path.join(domainRoot, 'SKILL.md'),
      '\uFEFF---\nname: boluo.material\ndescription: test\n---\n\n# Material\n',
    );

    const result = validateSkills(skillRoot);

    assert.deepEqual(result.errors, [
      'material/SKILL.md 文件不能包含 UTF-8 BOM，请保存为 UTF-8 without BOM',
    ]);
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});

test('normalizeSkillMarkdownFiles removes BOMs from every SKILL.md under a skills root', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'boluo-skills-'));
  try {
    const materialRoot = path.join(tempRoot, 'material');
    const shareRoot = path.join(tempRoot, 'share');
    fs.mkdirSync(materialRoot, { recursive: true });
    fs.mkdirSync(shareRoot, { recursive: true });
    fs.writeFileSync(path.join(materialRoot, 'SKILL.md'), '\uFEFF---\nname: boluo.material\n---\n');
    fs.writeFileSync(path.join(shareRoot, 'SKILL.md'), '\uFEFF---\nname: boluo.share\n---\n');

    await normalizeSkillMarkdownFiles(tempRoot);

    assert.equal(fs.readFileSync(path.join(materialRoot, 'SKILL.md'), 'utf8').startsWith('\uFEFF'), false);
    assert.equal(fs.readFileSync(path.join(shareRoot, 'SKILL.md'), 'utf8').startsWith('\uFEFF'), false);
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});
