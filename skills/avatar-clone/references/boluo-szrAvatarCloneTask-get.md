# boluo-szrAvatarCloneTask-get

## 常用命令

```bash
# 1. 查看参数结构
boluo-cli schema avatar-clone.szr-avatar-clone-task.get

# 2. 调用接口命令
boluo-cli avatar-clone get --params '{"id":123}' --json
```

## 参数

| 参数 | 位置 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | query | 是 | `integer` | 编号 |

## 输出说明

- 只输出 CLI JSON 中存在的字段。
- 空结果和接口错误必须区分。

## 行为说明

- 调用接口命令前必须先运行 schema 命令。
- 只能使用 schema 中存在的参数、字段和接口信息。
- schema 中不存在的参数不要传。
- 不要猜 ID、字段、接口路径、权限、请求体或响应结构。

## 参考

- Schema：`avatar-clone.szr-avatar-clone-task.get`
- Schema 命令：`boluo-cli schema avatar-clone.szr-avatar-clone-task.get`
- HTTP：`GET /app-api/boluo/open-api/szr-avatar-clone-task/get`
