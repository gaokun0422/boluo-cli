import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface RegistryOverrides {
  source: string;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const overridesPath = path.join(repoRoot, 'openapi', 'overrides.json');
const outputPath = path.join(repoRoot, 'openapi', 'boluo-openapi.json');

const overrides = JSON.parse(
  await readFile(overridesPath, 'utf8'),
) as RegistryOverrides;
const response = await fetch(overrides.source, {
  headers: {
    Accept: 'application/json',
  },
});

if (!response.ok) {
  throw new Error(
    `Failed to fetch OpenAPI document: ${response.status} ${response.statusText}`,
  );
}

const document = await response.json();

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);
