# boluo-szrVoiceCloneTask-page

## 常用命令

```bash
# 1. 查看参数结构
boluo-cli schema voice-clone.szr-voice-clone-task.page

# 2. 调用接口命令
boluo-cli voice-clone page --params '{"pageNo":123,"pageSize":123}' --json
```

## 参数

| 参数 | 位置 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | query | 否 | `string` | 声音名称 |
| `url` | query | 否 | `string` | 声音链接(支持mp3,wav,m4a格式) |
| `modelType` | query | 否 | `string` | 模型类型: cicada1.0/cicada3.0 |
| `language` | query | 否 | `string` | 语种: cn/en |
| `text` | query | 否 | `string` | 声音预览文案(不超过50字符) |
| `callback` | query | 否 | `string` | 回调地址 |
| `status` | query | 否 | `string` | 任务状态：pending/processing/completed/failed |
| `remark` | query | 否 | `string` | 备注 |
| `createTime` | query | 否 | `array` | 创建时间 |
| `storeId` | query | 否 | `integer` | 店铺id |
| `pageNo` | query | 是 | `integer` | 页码，从 1 开始 |
| `pageSize` | query | 是 | `integer` | 每页条数，最大值为 100 |

## 输出说明

- 只输出 CLI JSON 中存在的字段。
- 空结果和接口错误必须区分。

## 行为说明

- 调用接口命令前必须先运行 schema 命令。
- 只能使用 schema 中存在的参数、字段和接口信息。
- schema 中不存在的参数不要传。
- 不要猜 ID、字段、接口路径、权限、请求体或响应结构。

## 参考

- Schema：`voice-clone.szr-voice-clone-task.page`
- Schema 命令：`boluo-cli schema voice-clone.szr-voice-clone-task.page`
- HTTP：`GET /app-api/boluo/open-api/szr-voice-clone-task/page`
