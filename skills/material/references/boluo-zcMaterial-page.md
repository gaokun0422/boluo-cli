# boluo-zcMaterial-page

## 常用命令

```bash
# 1. 查看参数结构
boluo-cli schema material.zc-material.page

# 2. 调用接口命令
boluo-cli material page --params '{"pageNo":123,"pageSize":123}' --json
```

## 参数

| 参数 | 位置 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- | --- |
| `category` | query | 否 | `integer` | 资源分类（运营使用） |
| `mtypeList` | query | 否 | `array` | 资源类型 |
| `subType` | query | 否 | `string` | 次级分类 |
| `name` | query | 否 | `string` | 资源名称 |
| `duration` | query | 否 | `integer` | 视频时长(秒) |
| `parentId` | query | 否 | `integer` | 父级节点 ID |
| `tags` | query | 否 | `string` | 标签 |
| `size` | query | 否 | `integer` | 资源体积(字节) |
| `from` | query | 否 | `integer` | 素材来源（用户、系统、三方） |
| `isShopCatalog` | query | 否 | `integer` | 是否门店目录 |
| `coverImg` | query | 否 | `string` | 封面图url |
| `resourceJson` | query | 否 | `string` | 资源详情（oss返回的数据） |
| `itemId` | query | 否 | `integer` | 资源详细id |
| `ossUrl` | query | 否 | `string` | ossurl |
| `srtJson` | query | 否 | `string` | 字幕数据 |
| `folderCount` | query | 否 | `integer` | 文件夹数 |
| `audioCount` | query | 否 | `integer` | 音频数 |
| `projectVideoCount` | query | 否 | `integer` | 视频工程数 |
| `projectTuwenCount` | query | 否 | `integer` | 图文工程数 |
| `resCount` | query | 否 | `integer` | 成片数 |
| `videoCount` | query | 否 | `integer` | 视频数 |
| `imgCount` | query | 否 | `integer` | 图片数 |
| `scriptCount` | query | 否 | `integer` | 脚本数 |
| `storeId` | query | 否 | `integer` | 门店ID |
| `innerType` | query | 否 | `string` | 内部类型 |
| `frameCount` | query | 否 | `integer` | gif图片帧数 |
| `createTime` | query | 否 | `array` | 创建时间 |
| `remark` | query | 否 | `string` | 备注 |
| `searchKey` | query | 否 | `string` | 关键字 |
| `isUsed` | query | 否 | `boolean` | 查询已使用 |
| `materialIds` | query | 否 | `array` | 素材id集合 |
| `tagId` | query | 否 | `integer` | 标签ID |
| `excludePermissionIds` | query | 否 | `array` | 绕过数据权限的ID列表（这些ID不受部门权限限制） |
| `formatList` | query | 否 | `array` | 文件格式列表 (mp4/jpg/png/mp3) |
| `durationRange` | query | 否 | `array` | 视频时长范围(秒) |
| `sizeRange` | query | 否 | `array` | 文件大小范围(字节) |
| `colorPalette` | query | 否 | `string` | 颜色调色板搜索关键字 |
| `tagIdList` | query | 否 | `array` | 标签ID列表（多标签筛选） |
| `searchText` | query | 否 | `string` | 语义搜索文本（支持以文搜图/视频） |
| `aiAnalysisStatus` | query | 否 | `integer` | AI解析状态 (0:未解析 1:解析中 2:已完成 3:失败) |
| `shapeType` | query | 否 | `string` | 形状类型：horizontal-横图(宽>高), vertical-竖图(高>宽), custom-自定义比例 |
| `shapeRatio` | query | 否 | `number` | 自定义比例值（shapeType=custom时使用），如1.78表示16:9 |
| `shapeRatioTolerance` | query | 否 | `number` | 自定义比例容差（shapeType=custom 时使用），默认 0.1 |
| `smartFolderId` | query | 否 | `integer` | 智能文件夹 ID (查询智能文件夹下的素材) |
| `expired` | query | 否 | `integer` | 是否因过期已下架 (0:否 1:是)，按表字段 expired 筛选 |
| `favoriteOnly` | query | 否 | `boolean` | 为 true 时仅返回当前登录用户已收藏的素材 |
| `sortField` | query | 否 | `string` | 排序字段：recommended-推荐(按 id，与历史默认一致)；create_time；update_time；name；size；duration。 触发关键词向量合并检索（searchKey 走语义搜索）时忽略此参数与 sortAsc。 |
| `sortDesc` | query | 否 | `boolean` | 是否升序；未传时视为升序（与列表默认一致） |
| `creator` | query | 否 | `integer` | 创建人 |
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

- Schema：`material.zc-material.page`
- Schema 命令：`boluo-cli schema material.zc-material.page`
- HTTP：`GET /app-api/boluo/open-api/zc-material/page`
