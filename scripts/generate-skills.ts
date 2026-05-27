import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { boluoOpenApiRegistry } from '../src/registry/index.js';
import type { RegistryDomain, RegistryMethod, RegistryRisk } from '../src/registry/types.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function renderDomainSkillApiResources(
  domainName: string,
  domain: RegistryDomain,
): string {
  const lines = [
    '## API Resources',
    '',
    'API Resource 是可直接通过 `boluo-cli` 调用的能力接口。每次调用前必须先执行对应 schema 命令确认参数结构。',
    '',
    '| API Resource | 说明 |',
    '| --- | --- |',
  ];

  for (const [resourceName, resource] of sortEntries(domain.resources)) {
    for (const [methodName, method] of sortEntries(resource.methods)) {
      const fileName = getApiResourceFileName(resourceName, methodName);
      const apiResourceName = fileName.replace(/\.md$/, '');
      lines.push(
        `| [\`${apiResourceName}\`](references/${fileName}) | ${escapeTableCell(method.summary ?? '')}；schema：\`${domainName}.${resourceName}.${methodName}\`；风险：${renderRisk(method.risk)} |`,
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

export function renderDomainSkill(
  domainName: string,
  domain: RegistryDomain,
): string {
  return [
    '---',
    `name: boluo.${domainName}`,
    'version: 1.0.0',
    `description: 当用户需要使用菠萝平台${domain.title}能力，包括${renderDomainCapabilitySummary(domain)}时使用。`,
    'metadata:',
    '  requires:',
    '    bins:',
    '      - boluo-cli',
    '  cliHelp: boluo-cli help',
    '---',
    '',
    `# ${domain.title}`,
    '',
    '## 核心规则',
    '',
    '- 必须先遵守 `boluo.share`。',
    '- 所有接口能力都通过 `boluo-cli` 调用。',
    '- 调用 API Resource 原生命令前，必须先运行对应 `boluo-cli schema <domain.resource.method>` 查看参数结构。',
    '- 只能使用 schema 中存在的参数、字段和接口信息。',
    '- CLI JSON 输出是唯一事实来源。',
    '- 不要猜 ID、字段、接口路径、权限、请求体、响应结构或业务结果。',
    '- schema 返回错误时停止，不要继续调用接口。',
    '- 写入、更新、删除等有副作用操作必须由用户明确要求。',
    '',
    '## 快速决策',
    '',
    '- 根据用户意图，在下方 API Resources 中选择对应接口能力。',
    '- 调用前打开对应 reference 文档，先查 schema，再执行命令。',
    '',
    renderDomainSkillApiResources(domainName, domain).trimEnd(),
    '',
  ].join('\n');
}

export function renderApiResourceReference(
  domainName: string,
  resourceName: string,
  methodName: string,
  method: RegistryMethod,
  fileName = getApiResourceFileName(resourceName, methodName),
  useShortCommand = false,
): string {
  const apiResourceName = fileName.replace(/\.md$/, '');
  const schemaRef = `${domainName}.${resourceName}.${methodName}`;
  const requiredParameters = method.parameters.filter((parameter) => parameter.required);
  const paramsExample = requiredParameters.length > 0
    ? JSON.stringify(Object.fromEntries(
      requiredParameters.map((parameter) => [
        parameter.name,
        renderSchemaExampleValue(parameter.schema),
      ]),
    ))
    : '{}';
  const commandFlags = [
    ...(method.parameters.length > 0 ? [`--params '${paramsExample}'`] : []),
    ...(method.requestBody ? ["--data '{}'"] : []),
    ...(method.risk === 'high-risk-write' ? ['--yes'] : []),
  ];
  const lines = [
    `# ${apiResourceName}`,
    '',
    '## 常用命令',
    '',
    '```bash',
    '# 1. 查看参数结构',
    `boluo-cli schema ${schemaRef}`,
    '',
    '# 2. 调用接口命令',
    `boluo-cli ${domainName} ${useShortCommand ? '' : `${resourceName} `}${methodName}${commandFlags.length > 0 ? ` ${commandFlags.join(' ')}` : ''} --json`,
    '```',
    '',
    '## 参数',
    '',
    '| 参数 | 位置 | 必填 | 类型 | 说明 |',
    '| --- | --- | --- | --- | --- |',
  ];

  if (method.parameters.length === 0) {
    lines.push('| 无 | - | - | - | - |');
  } else {
    for (const parameter of method.parameters) {
      lines.push(
        `| \`${parameter.name}\` | ${parameter.in} | ${parameter.required ? '是' : '否'} | \`${renderSchemaType(parameter.schema)}\` | ${escapeTableCell(parameter.description ?? '')} |`,
      );
    }
  }

  lines.push(
    '',
    method.risk === 'read' ? '## 输出说明' : '## 风险说明',
    '',
  );

  if (method.risk === 'read') {
    lines.push(
      '- 只输出 CLI JSON 中存在的字段。',
      '- 空结果和接口错误必须区分。',
    );
  } else {
    lines.push(
      '- 写入、更新、删除等有副作用操作必须由用户明确要求。',
      '- schema 报错时停止，不要继续调用接口。',
    );

    if (method.risk === 'high-risk-write') {
      lines.push('- 高风险操作必须按 CLI 要求传入确认参数。');
    }
  }

  lines.push(
    '',
    '## 行为说明',
    '',
    '- 调用接口命令前必须先运行 schema 命令。',
    '- 只能使用 schema 中存在的参数、字段和接口信息。',
    '- schema 中不存在的参数不要传。',
    '- 不要猜 ID、字段、接口路径、权限、请求体或响应结构。',
    '',
    '## 参考',
    '',
    `- Schema：\`${schemaRef}\``,
    `- Schema 命令：\`boluo-cli schema ${schemaRef}\``,
    `- HTTP：\`${method.httpMethod} ${method.path}\``,
  );

  return `${lines.join('\n')}\n`;
}

export function getApiResourceFileName(
  resourceName: string,
  methodName: string,
): string {
  return `boluo-${toCamelCase(resourceName)}-${toCamelCase(methodName)}.md`;
}

export function replaceDomainSkillApiResources(
  skillMarkdown: string,
  apiResourcesMarkdown: string,
): string {
  const marker = '\n## API Resources\n';
  const markerIndex = skillMarkdown.indexOf(marker);
  if (markerIndex === -1) {
    return skillMarkdown.endsWith('\n') ? skillMarkdown : `${skillMarkdown}\n`;
  }

  return `${skillMarkdown.slice(0, markerIndex)}\n${apiResourcesMarkdown}`;
}

async function main(): Promise<void> {
  const skillRoot = path.join(REPO_ROOT, 'skills');

  for (const [domainName, domain] of sortEntries(boluoOpenApiRegistry.domains)) {
    const domainRoot = path.join(skillRoot, domainName);
    const referencesRoot = path.join(domainRoot, 'references');
    await rm(referencesRoot, { force: true, recursive: true });
    await mkdir(referencesRoot, { recursive: true });
    await rm(path.join(domainRoot, 'api-resources.generated.md'), { force: true });

    for (const [resourceName, resource] of sortEntries(domain.resources)) {
      for (const [methodName, method] of sortEntries(resource.methods)) {
        const fileName = getApiResourceFileName(resourceName, methodName);
        const outputPath = path.join(
          referencesRoot,
          fileName,
        );
        await writeFile(
          outputPath,
          renderApiResourceReference(
            domainName,
            resourceName,
            methodName,
            method,
            fileName,
            Object.keys(domain.resources).length === 1,
          ),
        );
      }
    }

    const skillPath = path.join(domainRoot, 'SKILL.md');
    try {
      const skillMarkdown = await readFile(skillPath, 'utf8');
      await writeFile(
        skillPath,
        replaceDomainSkillApiResources(
          skillMarkdown,
          renderDomainSkillApiResources(domainName, domain),
        ),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }

      await writeFile(skillPath, renderDomainSkill(domainName, domain));
    }
  }
}

function sortEntries<T extends Record<string, unknown>>(
  value: T,
): [keyof T & string, T[keyof T]][] {
  return Object.entries(value).sort(([left], [right]) => left.localeCompare(right)) as [
    keyof T & string,
    T[keyof T],
  ][];
}

function escapeTableCell(value: string): string {
  return value.replaceAll('|', '\\|').replace(/\r?\n/g, '<br>');
}

function renderRisk(risk: RegistryRisk): string {
  if (risk === 'read') {
    return '只读';
  }

  if (risk === 'high-risk-write') {
    return '高风险';
  }

  return '写入';
}

function renderSchemaType(schema: unknown): string {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return 'unknown';
  }

  const type = (schema as { type?: unknown }).type;
  return typeof type === 'string' ? type : 'unknown';
}

function renderSchemaExampleValue(schema: unknown): boolean | number | string | unknown[] {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return 'value';
  }

  const type = (schema as { type?: unknown }).type;
  if (type === 'integer' || type === 'number') return 123;
  if (type === 'boolean') return true;
  if (type === 'array') return [];
  return 'value';
}

function renderDomainCapabilitySummary(domain: RegistryDomain): string {
  const summaries: string[] = [];
  for (const [, resource] of sortEntries(domain.resources)) {
    for (const [, method] of sortEntries(resource.methods)) {
      if (method.summary) {
        summaries.push(method.summary.replace(/\r?\n/g, ''));
      }
    }
  }

  return summaries.length > 0 ? summaries.join('、') : '相关接口操作';
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function toCamelCase(value: string): string {
  return toKebabCase(value).replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
