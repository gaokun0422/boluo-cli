---
name: boluo.share
description: 当需要读取菠萝平台数据、配置 boluo-cli、处理 OpenAPI Key、解析 CLI JSON 输出或排查 boluo-cli 错误时使用。
metadata:
  requires:
    bins:
      - boluo-cli
    versions:
      boluo-cli: ">=0.3.3"
  cliHelp: boluo-cli help
---

本能力包规定菠萝平台能力的通用调用边界。凡是需要平台数据，都通过 `boluo-cli` 获取，并以 CLI JSON 输出作为事实来源。

## 使用前检查

- 不确定命令用法时，运行 `boluo-cli help`。
- 需要确认安装版本时，运行 `boluo-cli --version`；版本必须不低于 `0.3.3`。
- 第一次使用或命令异常时，先运行 `boluo-cli doctor --json`。
- 需要验证接口连通性时，运行 `boluo-cli doctor --json --check-api`。

## 鉴权

- 平台 OpenAPI 只使用 `X-OpenApi-Key` 鉴权。
- CLI 环境变量只使用 `BOLUO_OPENAPI_KEY`。
- 可选环境变量：`BOLUO_OPENAPI_ENDPOINT`。
- 不要尝试 `Authorization`、`Bearer`、`tenant-id`、`BOLUO_AUTHORIZATION`、`BOLUO_TENANT_ID` 或 admin-api。
- 遇到 `MISSING_OPENAPI_KEY` 时，直接提示用户配置 `BOLUO_OPENAPI_KEY` 或传入 `--openapi-key`，不要改用其他鉴权方式试错。

## 输出与边界

- 不要猜接口路径、字段、ID、权限或返回结构。
- CLI JSON 中不存在的字段不能编造。
- 写操作、删除操作和有副作用的操作必须先看对应 domain skill 的说明；高风险原子命令需要 `--yes`。
- 如果 schema 返回 `SCHEMA_UNRESOLVED_REFS`，说明上游 OpenAPI 缺少可展开的 body schema；不要自行推断请求体字段。
