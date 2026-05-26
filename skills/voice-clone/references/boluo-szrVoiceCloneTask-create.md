# boluo-szrVoiceCloneTask-create

## 常用命令

```bash
# 1. 查看参数结构
boluo-cli schema voice-clone.szr-voice-clone-task.create

# 2. 调用接口命令
boluo-cli voice-clone create --data '{}' --json
```

## 参数

| 参数 | 位置 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| 无 | - | - | - | - |

## 风险说明

- 写入、更新、删除等有副作用操作必须由用户明确要求。
- schema 报错时停止，不要继续调用接口。

## 行为说明

- 调用接口命令前必须先运行 schema 命令。
- 只能使用 schema 中存在的参数、字段和接口信息。
- schema 中不存在的参数不要传。
- 不要猜 ID、字段、接口路径、权限、请求体或响应结构。

## 参考

- Schema：`voice-clone.szr-voice-clone-task.create`
- Schema 命令：`boluo-cli schema voice-clone.szr-voice-clone-task.create`
- HTTP：`POST /app-api/boluo/open-api/szr-voice-clone-task/create`
