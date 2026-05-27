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
- 调用 API Resource 原生命令前，必须先运行对应 `boluo-cli schema <domain.resource.method>` 查看参数结构。
- 搜索、浏览、分页等高频只读场景优先使用 shortcut 命令，例如 `boluo-cli material +page --search-key 海报 --page-no 1 --page-size 20 --json`。
- 只能使用 schema 中存在的参数、字段和接口信息。
- CLI JSON 输出是唯一事实来源。
- 不要猜素材 ID、字段、接口路径、权限、请求体、响应结构或业务结果。
- schema 返回错误时停止，不要继续调用接口。
- 写入、更新、删除等有副作用操作必须由用户明确要求。

## 快速决策

| 用户意图 | 使用 API Resource |
| --- | --- |
| 看某个文件夹下有什么素材 | 先用 `boluo-cli material +page --search-key <文件夹名> --page-no 1 --page-size 20 --json` 查找文件夹，再用 `--parent-id <文件夹 ID>` 查询该文件夹下素材 |
| 找、查、搜索、浏览、筛选素材 | 优先用 `boluo-cli material +page --search-key <关键词> --page-no 1 --page-size 20 --json`；复杂参数再看 [`boluo-zcMaterial-page`](references/boluo-zcMaterial-page.md) |
| 查看素材详情、完整信息、某个素材 | [`boluo-zcMaterial-get`](references/boluo-zcMaterial-get.md) |
| 用户说“第 N 个” | 先从上一轮 CLI JSON 结果取第 N 项素材 ID，再使用 [`boluo-zcMaterial-get`](references/boluo-zcMaterial-get.md) |
| 用户说“更多/下一页/继续看” | 沿用上一轮搜索条件，把 `--page-no` 加 1 后再调用 `boluo-cli material +page ... --json` |

## 常见任务流程

### 查看某个文件夹下有什么素材

1. 先读取 `boluo-zcMaterial-page` 的 reference 文档，并运行 `boluo-cli schema material.zc-material.page` 查看参数结构。
2. 用用户给出的文件夹名称作为 `searchKey` 查询：`boluo-cli material +page --search-key <文件夹名> --page-no 1 --page-size 20 --json`。
3. 从 CLI JSON 结果中确认文件夹 ID；不能确认时不要猜 ID，说明缺少依据。
4. 确认文件夹 ID 后，再用 `boluo-cli material +page --parent-id <文件夹 ID> --page-no 1 --page-size 100 --json` 查询该文件夹下素材。
5. 不要优先调用 `get-tree`，除非用户提供了 `storeId` 和 `innerType`。

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
