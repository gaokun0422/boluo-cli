# boluo-szrVideoTasks-page

## 常用命令

```bash
# 1. 查看参数结构
boluo-cli schema digital-human-video.szr-video-tasks.page

# 2. 调用接口命令
boluo-cli digital-human-video page --params '{"pageNo":123,"pageSize":123}' --json
```

## 参数

| 参数 | 位置 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| `videoTaskName` | query | 否 | `string` | 视频任务名称 |
| `screenWidth` | query | 否 | `integer` | 屏幕宽度 |
| `screenHeight` | query | 否 | `integer` | 屏幕高度 |
| `resolutionRate` | query | 否 | `integer` | 数字人分辨率：0-1080p，1-4K |
| `bgColor` | query | 否 | `string` | 背景颜色 |
| `progress` | query | 否 | `integer` | 任务进度0-100 |
| `msg` | query | 否 | `string` | 异常或失败的错误信息 |
| `videoUrl` | query | 否 | `string` | 视频播放地址 |
| `subtitleDataUrl` | query | 否 | `string` | 字幕时间轴文件URL |
| `previewUrl` | query | 否 | `string` | 视频预览图片URL |
| `duration` | query | 否 | `number` | 视频时长(秒) |
| `status` | query | 否 | `string` | 任务状态：pending/processing/completed/failed |
| `chanJingTaskStatus` | query | 否 | `integer` | 状态:10=生成中,30=成功,4X=参数异常,5X=服务异常 |
| `remark` | query | 否 | `string` | 备注 |
| `createTime` | query | 否 | `array` | 创建时间 |
| `appPlat` | query | 否 | `string` | 客户端平台 |
| `openId` | query | 否 | `string` | 用户id |
| `appId` | query | 否 | `string` | 客户端id |
| `storeId` | query | 否 | `integer` | 店铺id |
| `deptId` | query | 否 | `integer` | 部门id |
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

- Schema：`digital-human-video.szr-video-tasks.page`
- Schema 命令：`boluo-cli schema digital-human-video.szr-video-tasks.page`
- HTTP：`GET /app-api/boluo/open-api/szr-video-tasks/page`
