import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface SkillValidationResult {
  errors: string[];
}

const RESOURCE_LINK_RE = /\[`([^`]+)`\]\(references\/([^)]+)\).*?`([^`]+)`/g;

export function validateSkills(skillsRoot: string): SkillValidationResult {
  const errors: string[] = [];

  for (const domainName of fs.readdirSync(skillsRoot)) {
    const domainRoot = path.join(skillsRoot, domainName);
    const stat = fs.statSync(domainRoot);
    if (!stat.isDirectory()) {
      continue;
    }

    if (fs.existsSync(path.join(domainRoot, 'api-resources.generated.md'))) {
      errors.push(
        `${domainName}/api-resources.generated.md 已废弃，请改用 references/boluo-<接口模块驼峰>-<功能驼峰>.md`,
      );
    }

    const skillPath = path.join(domainRoot, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      continue;
    }

    const skillMarkdown = fs.readFileSync(skillPath, 'utf8');
    if (skillMarkdown.startsWith('\uFEFF')) {
      errors.push(`${domainName}/SKILL.md 文件不能包含 UTF-8 BOM，请保存为 UTF-8 without BOM`);
    }

    if (!skillMarkdown.includes('## API Resources')) {
      continue;
    }

    for (const match of skillMarkdown.matchAll(RESOURCE_LINK_RE)) {
      const resourceName = match[1];
      const referenceFile = match[2];
      const schemaRef = match[3];
      const relativePath = `${domainName}/references/${referenceFile}`;

      if (!/^boluo-[a-z][a-zA-Z0-9]*-[a-z][a-zA-Z0-9]*\.md$/.test(referenceFile)) {
        errors.push(`${relativePath} 文件名必须符合 boluo-<接口模块驼峰>-<功能驼峰>.md`);
      }

      if (`${resourceName}.md` !== referenceFile) {
        errors.push(`${relativePath} 文件名必须与 API Resource 名称一致`);
      }

      const referencePath = path.join(domainRoot, 'references', referenceFile);
      if (!fs.existsSync(referencePath)) {
        errors.push(`${relativePath} 不存在`);
        continue;
      }

      const referenceMarkdown = fs.readFileSync(referencePath, 'utf8');
      const schemaCommand = `boluo-cli schema ${schemaRef}`;
      if (!referenceMarkdown.includes(schemaCommand)) {
        errors.push(`${relativePath} 缺少 schema 命令：${schemaCommand}`);
      }

      if (!/boluo-cli (?!schema\b)[^\n]+ --json/.test(referenceMarkdown)) {
        errors.push(`${relativePath} 缺少接口调用命令`);
      }
    }
  }

  return { errors };
}

function main(): void {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = validateSkills(path.join(repoRoot, 'skills'));

  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
