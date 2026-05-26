# boluo-pjProjectNote-page

## 常用命令

```bash
# 1. 查看参数结构
boluo-cli schema project-note.pj-project-note.page

# 2. 调用接口命令
boluo-cli project-note pj-project-note page --params '{"pageNo":123,"pageSize":123}' --json
```

## 参数

| 参数 | 位置 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| `parentId` | query | 否 | `integer` | 父文件夹ID |
| `batchIndex` | query | 否 | `integer` | 生成批次ID |
| `title` | query | 否 | `string` | 项目标题 |
| `type` | query | 否 | `string` | 项目类型 |
| `scriptTitle` | query | 否 | `string` | 脚本标题 |
| `cover` | query | 否 | `string` | 项目封面图url |
| `composeType` | query | 否 | `string` | 合成类型 |
| `ratio` | query | 否 | `string` | 视频宽高比 |
| `padding` | query | 否 | `string` | 填充方式 |
| `activeTemplateIndex` | query | 否 | `integer` | 当前激活的模板索引 |
| `durationMode` | query | 否 | `string` | 时长模式 |
| `duplicateConfig` | query | 否 | `string` | 去重clip |
| `remark` | query | 否 | `string` | 备注 |
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

- Schema：`project-note.pj-project-note.page`
- Schema 命令：`boluo-cli schema project-note.pj-project-note.page`
- HTTP：`GET /app-api/boluo/open-api/pj-project-note/page`
