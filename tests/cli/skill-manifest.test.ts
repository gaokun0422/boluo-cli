import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..', '..', '..');

test('manifest declares local skill files that exist', () => {
  const manifestPath = path.join(repoRoot, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    skills?: string[];
  };

  assert.deepEqual(manifest.skills, [
    'skills/share/SKILL.md',
    'skills/material/SKILL.md',
  ]);

  for (const skillPath of manifest.skills) {
    const fullPath = path.join(repoRoot, skillPath);
    assert.equal(fs.existsSync(fullPath), true, `${skillPath} should exist`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.match(content, /^---\r?\n/m);
    assert.match(content, /boluo-cli/);
  }
});

test('package publish files include skills', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'),
  ) as { files?: string[] };

  assert.ok(packageJson.files?.includes('skills'));
});

test('share skill matches boluo-cli metadata contract', () => {
  const shareSkill = fs.readFileSync(
    path.join(repoRoot, 'skills/share/SKILL.md'),
    'utf8',
  );

  assert.match(shareSkill, /name: boluo\.share/);
  assert.match(shareSkill, /boluo-cli: ">=0\.3\.1"/);
  assert.match(shareSkill, /0\.3\.1/);
  assert.doesNotMatch(shareSkill, /BOLUO_ACCEPT_LANGUAGE/);
});

test('skill descriptions are written in Chinese', () => {
  const manifestPath = path.join(repoRoot, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    skills?: string[];
  };

  assert.ok(manifest.skills);
  for (const skillPath of manifest.skills) {
    const content = fs.readFileSync(path.join(repoRoot, skillPath), 'utf8');
    const description = content.match(/^description:\s*(.+)$/m)?.[1] ?? '';
    assert.doesNotMatch(description, /^Use when\b/, `${skillPath} description should be Chinese`);
    assert.match(description, /[\u4e00-\u9fff]/, `${skillPath} description should contain Chinese`);
  }
});

test('material skill routes to API Resource references', () => {
  const materialSkill = fs.readFileSync(
    path.join(repoRoot, 'skills/material/SKILL.md'),
    'utf8',
  );
  const searchPath = path.join(
    repoRoot,
    'skills/material/references/boluo-zcMaterial-page.md',
  );
  const getPath = path.join(
    repoRoot,
    'skills/material/references/boluo-zcMaterial-get.md',
  );

  assert.match(materialSkill, /## API Resources/);
  assert.match(materialSkill, /references\/boluo-zcMaterial-page\.md/);
  assert.match(materialSkill, /references\/boluo-zcMaterial-get\.md/);
  assert.equal(fs.existsSync(searchPath), true);
  assert.equal(fs.existsSync(getPath), true);

  const search = fs.readFileSync(searchPath, 'utf8');
  const get = fs.readFileSync(getPath, 'utf8');
  assert.match(search, /boluo-cli schema material\.zc-material\.page/);
  assert.match(get, /boluo-cli schema material\.zc-material\.get/);
});
