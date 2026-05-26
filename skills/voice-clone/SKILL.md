---
name: boluo.voice-clone
version: 1.0.0
description: 当用户需要使用菠萝平台声音克隆能力，包括创建声音克隆任务、删除声音克隆任务、获得声音克隆任务、获得声音克隆任务分页、更新声音克隆任务时使用。
metadata:
  requires:
    bins:
      - boluo-cli
  cliHelp: boluo-cli help
---

# 声音克隆

## 核心规则

- 必须先遵守 `boluo.share`。
- 所有接口能力都通过 `boluo-cli` 调用。
- 调用任何接口命令前，必须先运行对应 `boluo-cli schema <domain.resource.method>` 查看参数结构。
- 只能使用 schema 中存在的参数、字段和接口信息。
- CLI JSON 输出是唯一事实来源。
- 不要猜 ID、字段、接口路径、权限、请求体、响应结构或业务结果。
- schema 返回错误时停止，不要继续调用接口。
- 写入、更新、删除等有副作用操作必须由用户明确要求。

## 快速决策

- 根据用户意图，在下方 API Resources 中选择对应接口能力。
- 调用前打开对应 reference 文档，先查 schema，再执行命令。

## API Resources

API Resource 是可直接通过 `boluo-cli` 调用的能力接口。每次调用前必须先执行对应 schema 命令确认参数结构。

| API Resource | 说明 |
| --- | --- |
| [`boluo-szrVoiceCloneTask-create`](references/boluo-szrVoiceCloneTask-create.md) | 创建声音克隆任务；schema：`voice-clone.szr-voice-clone-task.create`；风险：写入 |
| [`boluo-szrVoiceCloneTask-delete`](references/boluo-szrVoiceCloneTask-delete.md) | 删除声音克隆任务；schema：`voice-clone.szr-voice-clone-task.delete`；风险：高风险 |
| [`boluo-szrVoiceCloneTask-get`](references/boluo-szrVoiceCloneTask-get.md) | 获得声音克隆任务；schema：`voice-clone.szr-voice-clone-task.get`；风险：只读 |
| [`boluo-szrVoiceCloneTask-page`](references/boluo-szrVoiceCloneTask-page.md) | 获得声音克隆任务分页；schema：`voice-clone.szr-voice-clone-task.page`；风险：只读 |
| [`boluo-szrVoiceCloneTask-update`](references/boluo-szrVoiceCloneTask-update.md) | 更新声音克隆任务；schema：`voice-clone.szr-voice-clone-task.update`；风险：写入 |
