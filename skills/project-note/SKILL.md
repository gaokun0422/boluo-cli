---
name: boluo.project-note
version: 1.0.0
description: 当用户需要使用菠萝平台图文批量生成能力，包括创建工程-批量生成-图文/脚本、删除工程-批量生成-图文/脚本、获得工程-批量生成-图文/脚本、获得工程-批量生成-图文/脚本分页、更新工程-批量生成-图文/脚本、更新工程状态、获得工程-批量生成-图文/脚本生成参数、获得项目场景主列表时使用。
metadata:
  requires:
    bins:
      - boluo-cli
  cliHelp: boluo-cli help
---

# 图文批量生成

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
| [`boluo-pjProjectNote-create`](references/boluo-pjProjectNote-create.md) | 创建工程-批量生成-图文/脚本；schema：`project-note.pj-project-note.create`；风险：写入 |
| [`boluo-pjProjectNote-delete`](references/boluo-pjProjectNote-delete.md) | 删除工程-批量生成-图文/脚本；schema：`project-note.pj-project-note.delete`；风险：高风险 |
| [`boluo-pjProjectNote-get`](references/boluo-pjProjectNote-get.md) | 获得工程-批量生成-图文/脚本；schema：`project-note.pj-project-note.get`；风险：只读 |
| [`boluo-pjProjectNote-page`](references/boluo-pjProjectNote-page.md) | 获得工程-批量生成-图文/脚本分页；schema：`project-note.pj-project-note.page`；风险：只读 |
| [`boluo-pjProjectNote-update`](references/boluo-pjProjectNote-update.md) | 更新工程-批量生成-图文/脚本；schema：`project-note.pj-project-note.update`；风险：写入 |
| [`boluo-pjProjectNote-updateStatus`](references/boluo-pjProjectNote-updateStatus.md) | 更新工程状态；schema：`project-note.pj-project-note.updateStatus`；风险：写入 |
| [`boluo-pjProjectNoteConfig-getByProjectId`](references/boluo-pjProjectNoteConfig-getByProjectId.md) | 获得工程-批量生成-图文/脚本生成参数；schema：`project-note.pj-project-note-config.get-by-project-id`；风险：只读 |
| [`boluo-pjProjectNoteScene-listByProjectId`](references/boluo-pjProjectNoteScene-listByProjectId.md) | 获得项目场景主列表；schema：`project-note.pj-project-note-scene.list-by-project-id`；风险：只读 |
