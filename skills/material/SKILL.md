---
name: boluo.material
version: 1.0.0
description: 当用户需要使用菠萝素材库能力，包括搜索、浏览、分页筛选、查看详情、创建、更新、删除、获取素材树、初始化文件夹、随机图片、批量随机图片或批量标记门店图片已使用时使用。
metadata:
  requires:
    bins:
      - boluo-cli
  cliHelp: boluo-cli help
---

# 菠萝素材库

## 核心规则

- 必须先遵守 `boluo.share`。
- 所有接口能力都通过 `boluo-cli` 调用。
- 调用任何接口命令前，必须先运行对应 `boluo-cli schema <domain.resource.method>` 查看参数结构。
- 只能使用 schema 中存在的参数、字段和接口信息。
- CLI JSON 输出是唯一事实来源。
- 不要猜素材 ID、字段、接口路径、权限、请求体、响应结构或业务结果。
- schema 返回错误时停止，不要继续调用接口。
- 写入、更新、删除等有副作用操作必须由用户明确要求。

## 快速决策

| 用户意图 | 使用 API Resource |
| --- | --- |
| 找、查、搜索、浏览、筛选素材 | [`boluo-zcMaterial-page`](references/boluo-zcMaterial-page.md) |
| 查看素材详情、完整信息、某个素材 | [`boluo-zcMaterial-get`](references/boluo-zcMaterial-get.md) |
| 用户说“第 N 个” | 先从上一轮 CLI JSON 结果取第 N 项素材 ID，再使用 [`boluo-zcMaterial-get`](references/boluo-zcMaterial-get.md) |
| 用户说“更多/下一页/继续看” | 沿用上一轮搜索条件，再使用 [`boluo-zcMaterial-page`](references/boluo-zcMaterial-page.md) |

## API Resources

API Resource 是可直接通过 `boluo-cli` 调用的能力接口。每次调用前必须先执行对应 schema 命令确认参数结构。

| API Resource | 说明 |
| --- | --- |
| [`boluo-zcMaterial-batchMarkImagesUsed`](references/boluo-zcMaterial-batchMarkImagesUsed.md) | 批量标记门店图片为已使用；schema：`material.zc-material.batch-mark-images-used`；风险：写入 |
| [`boluo-zcMaterial-create`](references/boluo-zcMaterial-create.md) | 创建素材；schema：`material.zc-material.create`；风险：写入 |
| [`boluo-zcMaterial-delete`](references/boluo-zcMaterial-delete.md) | 删除素材；schema：`material.zc-material.delete`；风险：高风险 |
| [`boluo-zcMaterial-get`](references/boluo-zcMaterial-get.md) | 获得素材；schema：`material.zc-material.get`；风险：只读 |
| [`boluo-zcMaterial-getBatchRandomImages`](references/boluo-zcMaterial-getBatchRandomImages.md) | 批量获取随机门店图片配图；schema：`material.zc-material.get-batch-random-images`；风险：写入 |
| [`boluo-zcMaterial-getRandomImages`](references/boluo-zcMaterial-getRandomImages.md) | 获取随机门店图片用于配图；schema：`material.zc-material.get-random-images`；风险：写入 |
| [`boluo-zcMaterial-getTree`](references/boluo-zcMaterial-getTree.md) | 获取门店素材树；schema：`material.zc-material.get-tree`；风险：只读 |
| [`boluo-zcMaterial-initFolder`](references/boluo-zcMaterial-initFolder.md) | 初始化门店素材文件夹；schema：`material.zc-material.init-folder`；风险：只读 |
| [`boluo-zcMaterial-page`](references/boluo-zcMaterial-page.md) | 获得素材分页；schema：`material.zc-material.page`；风险：只读 |
| [`boluo-zcMaterial-update`](references/boluo-zcMaterial-update.md) | 更新素材；schema：`material.zc-material.update`；风险：写入 |
