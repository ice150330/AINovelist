# AINovelist

AINovelist / NovelCraft 是面向长篇小说创作的 Windows 桌面端 AI 写作工作台。项目目标不是做普通聊天式续写器，而是把章节写作、人物关系、知识库、记忆一致性和结构化 AI 生成整合到同一个本地优先的创作环境中。

当前仓库已经初始化为 Electron + Vue3 + TypeScript 应用，并完成 MVP 阶段的本地作品与章节数据闭环。

## 当前能力

- Electron 桌面应用骨架。
- Vue3 Renderer 与 Element Plus 暖色纸面 UI。
- 安全的 main / preload / renderer 分层。
- 创建、列出、打开作品。
- 创建、读取、保存章节 Markdown。
- 章节元数据 JSON 存储。
- 原子写入、写前备份和路径越界防护。
- Mock AI Provider 与结构化生成表单。
- 知识库页面框架。
- Pencil UI 预设计稿与设计规范。

## 技术栈

- Electron + electron-vite
- Vue3 + TypeScript
- Vue Router
- Element Plus
- Pinia
- Zod
- Vitest
- Markdown + JSON 本地存储
- pnpm

## 目录结构

```text
D:/AINovelist
├── docs/                  # 分析报告与项目文档
├── pen/                   # UI 设计规范与 Pencil 设计稿
├── plan/                  # 项目计划书
├── src/
│   ├── main/              # Electron 主进程、IPC、服务、仓储、Provider
│   ├── preload/           # 安全暴露给 Renderer 的 window.novelcraft API
│   ├── renderer/          # Vue 前端界面
│   └── shared/            # IPC channel、Zod schema、共享常量
├── tests/unit/            # Vitest 单元测试
├── package.json
└── CLAUDE.md              # Claude Code 协作指南
```

默认运行时数据目录：

```text
F:/AINovelistData/workspace
F:/AINovelistData/knowledge_base
F:/AINovelistData/models
F:/AINovelistData/cache
```

每个作品会保存为本地文件夹，章节正文使用 Markdown，元数据与结构化信息使用 JSON。

## 开发命令

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

类型检查：

```bash
pnpm typecheck
```

运行测试：

```bash
pnpm test
```

运行单元测试：

```bash
pnpm test:unit
```

运行单个测试文件：

```bash
pnpm vitest run tests/unit/fileStore.test.ts
```

构建应用：

```bash
pnpm build
```

预览构建结果：

```bash
pnpm preview
```

当前项目还没有 `lint` 脚本。

## 架构约束

Renderer 不直接访问 `fs`、`shell`、`ipcRenderer`、原生模块或任意绝对路径。所有本地文件能力都通过 preload 暴露的窄 API 进入主进程，再由 service / repository 层处理。

```text
Vue Renderer
  -> window.novelcraft preload API
  -> Electron ipcMain handlers
  -> main process services
  -> repositories / fileStore
  -> Markdown + JSON files
```

新增跨进程能力时，应同步更新：

1. `src/shared/schemas/`
2. `src/shared/ipc/channels.ts`
3. `src/main/ipc/index.ts`
4. `src/preload/api.ts`
5. Renderer 调用处

## UI 与设计

设计规范见 `pen/pen.md`。核心方向：中文主体、暖黄色 / 羊皮纸、低饱和、轻阴影、统一圆角、长文本优先、低打扰创作体验。

Pencil 设计稿位于 `pen/UI.pen`，包含：

- Tokens / Style Guide
- Components
- MVP Page Matrix
- Beta / Pro 预留页面
- Flows

`.pen` 文件需要通过 Pencil MCP 工具访问，不要作为普通文本文件读取或修改。

## 项目计划

当前主计划见 `plan/项目计划书V0.3.md`。近期优先级：

1. 稳定本地作品与章节写作闭环。
2. 完善知识库 Markdown 扫描、解析和搜索。
3. 接入真实 AI Provider 与结构化 Prompt Builder。
4. 建立基础记忆机制：章节摘要、硬约束、作者确认后入库。
5. 再推进人物关系、导出、一致性审查和本地向量检索。

## 注意事项

- 不要提交本地作品数据、模型文件、缓存、API Key 或生成安装包。
- `.env` 不提交，`.env.example` 可以提交。
- `F:/AINovelistData` 下的数据属于本地运行数据，不属于源码。
- ONNX、本地向量检索、SQLite 或复杂导出能力应作为后续 Spike，不阻塞 MVP。
