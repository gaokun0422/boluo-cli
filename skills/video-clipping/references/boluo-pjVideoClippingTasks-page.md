# boluo-pjVideoClippingTasks-page

## 常用命令

```bash
# 1. 查看参数结构
boluo-cli schema video-clipping.pj-video-clipping-tasks.page

# 2. 调用接口命令
boluo-cli video-clipping page --params '{"pageNo":123,"pageSize":123}' --json
```

## 参数

| 参数 | 位置 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| `taskId` | query | 否 | `string` | 主任务ID |
| `jobId` | query | 否 | `string` | 阿里云任务ID |
| `taskSourceType` | query | 否 | `integer` | 0-爆款解析、1-单独使用 |
| `resultJson` | query | 否 | `string` | 结果json：{"video_oss_url":"http"} |
| `status` | query | 否 | `integer` | 状态：-1失败 0未开始，1进行中，2已完成 |
| `createTime` | query | 否 | `array` | 创建时间 |
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

- Schema：`video-clipping.pj-video-clipping-tasks.page`
- Schema 命令：`boluo-cli schema video-clipping.pj-video-clipping-tasks.page`
- HTTP：`GET /app-api/boluo/open-api/pj-video-clipping-tasks/page`
