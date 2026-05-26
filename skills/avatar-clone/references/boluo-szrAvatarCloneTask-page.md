# boluo-szrAvatarCloneTask-page

## 常用命令

```bash
# 1. 查看参数结构
boluo-cli schema avatar-clone.szr-avatar-clone-task.page

# 2. 调用接口命令
boluo-cli avatar-clone page --params '{"pageNo":123,"pageSize":123}' --json
```

## 参数

| 参数 | 位置 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | query | 否 | `string` | 定制数字人名称 |
| `materialVideo` | query | 否 | `string` | 外网可下载播放的视频文件链接 |
| `callback` | query | 否 | `string` | 回调地址 |
| `trainType` | query | 否 | `string` | 训练类型：figure【仅生成形象形象,允许传递无声视频】 |
| `language` | query | 否 | `string` | 语种：默认为cn,支持en英文,其他语种暂不支持 |
| `status` | query | 否 | `string` | 任务状态：pending/processing/completed/failed |
| `remark` | query | 否 | `string` | 备注 |
| `resolutionRate` | query | 否 | `integer` | 数字人分辨率：0-1080p，1-4K |
| `createTime` | query | 否 | `array` | 创建时间 |
| `appPlat` | query | 否 | `string` | 客户端平台 |
| `openId` | query | 否 | `string` | 用户id |
| `appId` | query | 否 | `string` | 客户端id |
| `storeId` | query | 否 | `integer` | 店铺id |
| `chanJingPersonId` | query | 否 | `string` | 蝉镜数字人形象id |
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

- Schema：`avatar-clone.szr-avatar-clone-task.page`
- Schema 命令：`boluo-cli schema avatar-clone.szr-avatar-clone-task.page`
- HTTP：`GET /app-api/boluo/open-api/szr-avatar-clone-task/page`
