# boluo-cli

菠萝平台 CLI 和 Agent Skills。它把菠萝 OpenAPI 包装成适合 Agent 使用的 API Resource：调用接口前先查 schema，再执行对应命令。

## 快速开始

安装 CLI：

```bash
npm install -g boluo-cli
```

安装同仓库 Agent Skills：

```bash
npx skills add gaokun0422/boluo-cli -y -g
```

配置 OpenAPI Key。PowerShell 使用：

```bash
$env:BOLUO_OPENAPI_KEY="xxx"
$env:BOLUO_OPENAPI_ENDPOINT="https://api3.boluo-ai.com"
```

Windows cmd 使用：

```bat
set BOLUO_OPENAPI_KEY=xxx
set BOLUO_OPENAPI_ENDPOINT=https://api3.boluo-ai.com
```

macOS/Linux 使用：

```bash
export BOLUO_OPENAPI_KEY=xxx
export BOLUO_OPENAPI_ENDPOINT=https://api3.boluo-ai.com
```

检查安装：

```bash
boluo-cli --version
boluo-cli doctor --json
boluo-cli doctor --json --check-api
```

Agent 使用时必须同时具备两件事：

1. `boluo-cli` 命令可执行。
2. Skills 已从 `gaokun0422/boluo-cli` 安装。

仅安装 npm 包不会让 Agent 自动知道何时调用素材库能力。

## 使用方式

### Schema 优先

调用任何接口前，先查看参数结构：

```bash
boluo-cli schema material.zc-material.page
```

再调用接口：

```bash
boluo-cli material page --params '{"searchKey":"海报","mtypeList":["img"]}' --json
```

素材详情示例：

```bash
boluo-cli schema material.zc-material.get
boluo-cli material get --params '{"id":657059}' --json
```

### 命令层级

完整命令层级是：

```text
boluo-cli <domain> <resource> <method>
```

如果某个 domain 只有一个 resource，可以省略 resource：

```text
boluo-cli <domain> <method>
```

例如 `material` 当前只有 `zc-material` 一个 resource，所以可以写：

```bash
boluo-cli schema material.zc-material.page
boluo-cli material page --params '{"searchKey":"海报"}' --json
```

如果 domain 下有多个 resource，则必须写完整三段，避免猜接口：

```bash
boluo-cli project-note pj-project-note page --params '{}' --json
```

### 参数位置

参数位置以 `boluo-cli schema <domain.resource.method>` 输出的 OpenAPI 文档为准：

- `parameters` 中 `in: "query"` 的字段使用 `--params <json>`。
- `requestBody` 中的 JSON 字段使用 `--data <json>`。
- 高风险写入接口需要 `--yes`

例如删除素材接口是 `DELETE`，但 `id` 在 schema 中是 query 参数，所以使用：

```bash
boluo-cli material delete --params '{"id":657059}' --yes --json
```

### API Resource

`schema` 引用格式始终是：

```text
<domain>.<resource>.<method>
```

例如：

```text
素材库 domain -> zc-material resource -> page method
```

### 已生成的 domain

当前 registry 已覆盖这些 OpenAPI domain：

- `material`：素材库
- `project-note`：图文批量生成
- `video-clipping`：视频拆条/剪辑
- `voice-clone`：声音克隆
- `digital-human-video`：数字人短视频
- `avatar-clone`：数字人形象克隆

## 鉴权和安全

默认接口前缀：

```text
https://api3.boluo-ai.com
```

鉴权只使用：

```text
X-OpenApi-Key / BOLUO_OPENAPI_KEY
```

不要使用：

```text
Authorization / Bearer / tenant-id / 旧 admin-api
```

安全规则：

- CLI JSON 输出是 Agent 的事实来源。
- 按 schema 传参，不要按 HTTP 方法猜参数位置。
- `DELETE` 默认是 `high-risk-write`。
- `high-risk-write` 必须加 `--yes`。
- 如果 schema 返回 `SCHEMA_UNRESOLVED_REFS`，说明上游 OpenAPI 缺少可展开的请求体 schema，不要猜请求体字段。

## Agent Skills

Skills 与 CLI 在同一仓库维护：

```text
skills/
├─ share/SKILL.md
├─ material/
│  ├─ SKILL.md
│  ├─ references/
│  │  ├─ boluo-zcMaterial-page.md
│  │  ├─ boluo-zcMaterial-get.md
│  │  └─ ...
├─ project-note/
│  ├─ SKILL.md
│  └─ references/
└─ video-clipping/
   ├─ SKILL.md
   └─ references/
```

- `share`：通用鉴权、自检、错误边界。
- 每个业务 skill 顶层 `SKILL.md`：核心规则、快速决策和 API Resources 表。
- `references/boluo-zcMaterial-page.md`：素材分页 API Resource。
- `references/boluo-zcMaterial-get.md`：素材详情 API Resource。
- `references/boluo-<接口模块驼峰>-<功能驼峰>.md`：从 registry 生成的单接口 API Resource 文档。

## Online Runtime

线上 Node AI 服务可以通过 `boluo-cli/ai-sdk` 复用同一份 OpenAPI 能力：

```ts
import { createBoluoAiSdkRuntime } from 'boluo-cli/ai-sdk';

const runtime = createBoluoAiSdkRuntime({
  auth: { openApiKey: headers['X-OpenApi-Key'] },
});
```

Online Runtime 只面向 AI SDK tools，不输出或要求模型执行 `boluo-cli` 命令。runtime 会直接注入当前 OpenAPI key 可用且 schema 可转换的业务工具。

## 自动生成

OpenAPI 生成链路：

```bash
npm run openapi:fetch
npm run openapi:generate
npm run skills:generate
npm run skills:validate
```

对应产物：

- `openapi/boluo-openapi.json`：上游 OpenAPI 快照。
- `src/registry/generated/boluo-openapi.json`：CLI 运行时 registry。
- `skills/*/references/*.md`：Skill 单接口 API Resource 文档。
- `skills:validate`：校验 API Resource 文档必须包含 schema 前置命令和接口调用命令。

完整刷新后建议运行：

```bash
npm test
npm run typecheck
npm run skills:validate
npm run pack:dry-run
```

## 本地开发

安装依赖：

```bash
npm install
```

构建：

```bash
npm run build
```

本地执行：

```bash
node bin/boluo-cli.js doctor --json
node bin/boluo-cli.js schema material.zc-material.page
node bin/boluo-cli.js material page --params '{}' --json
```

全局开发链接：

```bash
npm link
boluo-cli doctor --json
```

发布前检查包内容：

```bash
npm run pack:dry-run
```
