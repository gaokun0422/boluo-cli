import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { runCli } from '../../src/cli/index.js';

const repoRoot = process.cwd();
const packageJson = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'),
) as { version: string };

test('CLI prints help text', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['help'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  assert.equal(exitCode, 0);
  assert.match(output.join(''), /boluo-cli/);
  assert.doesNotMatch(output.join(''), /material search/);
  assert.match(output.join(''), /material page/);
  assert.match(output.join(''), /doctor --json/);
});

test('CLI prints version', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['--version'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  assert.equal(exitCode, 0);
  assert.equal(output.join('').trim(), packageJson.version);
});

test('CLI version is read from package metadata', () => {
  const source = fs.readFileSync(
    path.join(repoRoot, 'src/cli/index.ts'),
    'utf8',
  );

  assert.doesNotMatch(source, /const VERSION = '\d+\.\d+\.\d+'/);
});

test('CLI material short command rejects old search command', async () => {
  const output: string[] = [];
  const exitCode = await runCli(
    ['material', 'search', '--json'],
    (text) => output.push(text),
    (text) => output.push(text),
  );

  assert.equal(exitCode, 1);
  assert.deepEqual(JSON.parse(output.join('')), {
    ok: false,
    error: {
      code: 'COMMAND_NOT_FOUND',
      message: '未知接口命令：material zc-material search',
    },
  });
});

test('CLI material short command executes single-resource domain method', async () => {
  const originalFetch = globalThis.fetch;
  const output: string[] = [];
  let calledUrl = '';

  globalThis.fetch = async (input) => {
    calledUrl = String(input);
    return new Response(
      JSON.stringify({
        code: 0,
        data: {
          list: [{ id: 657059, mtype: 'img' }],
          total: 1,
        },
      }),
      { status: 200 },
    );
  };

  try {
    const exitCode = await runCli(
      [
        'material',
        'page',
        '--openapi-key',
        'openapi-key',
        '--params',
        '{"searchKey":"海报","mtypeList":["img"]}',
        '--json',
      ],
      (text) => output.push(text),
      (text) => output.push(text),
    );

    assert.equal(exitCode, 0);
    assert.equal(
      calledUrl,
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/page?searchKey=%E6%B5%B7%E6%8A%A5&mtypeList=img',
    );
    assert.deepEqual(JSON.parse(output.join('')), {
      ok: true,
      data: {
        list: [{ id: 657059, mtype: 'img' }],
        total: 1,
      },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('CLI doctor can verify Java API when requested', async () => {
  const originalFetch = globalThis.fetch;
  const output: string[] = [];
  let calledUrl = '';

  globalThis.fetch = async (input) => {
    calledUrl = String(input);
    return new Response(
      JSON.stringify({
        code: 0,
        data: {
          list: [],
          total: 0,
        },
      }),
      { status: 200 },
    );
  };

  try {
    const exitCode = await runCli(
      ['doctor', '--json', '--openapi-key', 'openapi-key', '--check-api'],
      (text) => output.push(text),
      (text) => output.push(text),
    );

    const result = JSON.parse(output.join(''));
    assert.equal(exitCode, 0);
    assert.equal(result.ok, true);
    assert.equal(result.data.checks.config.ok, true);
    assert.equal(result.data.checks.api.ok, true);
    assert.equal(
      calledUrl,
      'https://api3.boluo-ai.com/app-api/boluo/open-api/zc-material/page?pageNo=1&pageSize=1',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('CLI material short command forwards Java response contract errors', async () => {
  const originalFetch = globalThis.fetch;
  const output: string[] = [];

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        code: 1001,
        msg: '业务失败',
      }),
      { status: 200 },
    );

  try {
    const exitCode = await runCli(
      ['material', 'page', '--openapi-key', 'openapi-key', '--json'],
      (text) => output.push(text),
      (text) => output.push(text),
    );

    const result = JSON.parse(output.join(''));
    assert.equal(exitCode, 1);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'JAVA_API_ERROR');
    assert.equal(result.error.message, '业务失败');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('CLI doctor prints install checks as stable JSON', async () => {
  const originalOpenApiKey = process.env.BOLUO_OPENAPI_KEY;
  const originalApiEndpoint = process.env.BOLUO_OPENAPI_ENDPOINT;
  const output: string[] = [];

  delete process.env.BOLUO_OPENAPI_KEY;
  delete process.env.BOLUO_OPENAPI_ENDPOINT;

  try {
    const exitCode = await runCli(
      ['doctor', '--json'],
      (text) => output.push(text),
      (text) => output.push(text),
    );

    const result = JSON.parse(output.join(''));
    assert.equal(exitCode, 0);
    assert.equal(result.ok, true);
    assert.equal(result.data.name, 'boluo-cli');
    assert.equal(result.data.checks.node.ok, true);
    assert.equal(typeof result.data.checks.node.version, 'string');
    assert.equal(typeof result.data.checks.dist.ok, 'boolean');
    assert.equal(result.data.checks.config.ok, false);
    assert.equal(result.data.checks.config.code, 'MISSING_OPENAPI_KEY');
  } finally {
    if (originalOpenApiKey === undefined) {
      delete process.env.BOLUO_OPENAPI_KEY;
    } else {
      process.env.BOLUO_OPENAPI_KEY = originalOpenApiKey;
    }
    if (originalApiEndpoint === undefined) {
      delete process.env.BOLUO_OPENAPI_ENDPOINT;
    } else {
      process.env.BOLUO_OPENAPI_ENDPOINT = originalApiEndpoint;
    }
  }
});
