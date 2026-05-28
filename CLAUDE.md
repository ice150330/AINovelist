# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 语言与协作约定

- 本项目主要使用中文沟通、中文文档和中文报告。
- 代码标识符、配置键名、第三方 API 名称保持英文。
- 新增文档应放在 `docs/`、`docs/reports/` 或 `plan/`，不要堆到项目根目录。
- `.pen` 设计文件必须通过 Pencil MCP 访问，不要用普通文本工具读取或改写。

## 项目概览

AINovelist / NovelCraft 是面向长篇小说创作的 Windows 桌面端 AI 小说创作工作台。当前仓库已经初始化为 Electron + Vue3 + TypeScript 应用，并完成 MVP 的本地作品/章节数据闭环与 Mock AI 生成面板。

产品方向来自 `plan/项目计划书V0.3.md`：结构化叙事数据、本地 Markdown 知识库、结构化 Prompt Pipeline、基础记忆机制，以及后续的检索和一致性审查能力。`pen/pen.md` 和 `pen/UI.pen` 保存当前 UI 设计规范与预设计稿。

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动 Electron + Vue 开发环境
pnpm typecheck        # 同时检查 renderer Vue/TS 与 main/preload TS
pnpm test             # 运行全部 Vitest 测试
pnpm test:unit        # 运行 tests/unit 下的单元测试
pnpm test:integration # 运行 tests/integration 下的集成测试（目录存在时）
pnpm build            # 先 typecheck，再执行 electron-vite build
pnpm preview          # 预览构建后的 Electron 应用
```

运行单个测试文件示例：

```bash
pnpm vitest run tests/unit/fileStore.test.ts
```

当前 `package.json` 没有 `lint` 脚本，不要假设 `pnpm lint` 可用。

## 代码架构

应用采用 Electron 安全分层：

```text
Vue Renderer
  -> window.novelcraft preload API
  -> Electron ipcMain handlers
  -> main process services
  -> repositories / fileStore
  -> Markdown + JSON files under F:/AINovelistData
```

关键边界：Renderer 不直接访问 `fs`、`shell`、`ipcRenderer`、原生模块或任意绝对路径；所有本地能力通过 preload 暴露的窄 API 进入主进程。窗口配置在 `src/main/window/createMainWindow.ts`，保持 `contextIsolation: true`、`nodeIntegration: false`、`sandbox: true`。

### Main process

- `src/main/index.ts`：Electron 生命周期入口，注册 IPC 并创建主窗口。
- `src/main/ipc/index.ts`：所有 IPC handler 的集中注册点，入参用 shared Zod schema 校验。
- `src/main/services/pathService.ts`：运行环境路径、safe id 校验和路径越界防护。
- `src/main/services/fileStore.ts`：JSON/Text 读写、临时文件原子替换和写前备份。
- `src/main/services/projectService.ts` 与 `chapterService.ts`：应用服务层，负责生成 ID、更新时间戳并编排 repository。
- `src/main/repositories/projectRepository.ts` 与 `chapterRepository.ts`：文件系统持久化，维护作品目录、章节 Markdown 和章节元数据。
- `src/main/providers/mockProvider.ts`：当前 AI 生成的 Mock Provider。

### Preload 与 IPC 契约

- `src/preload/index.ts` 使用 `contextBridge.exposeInMainWorld('novelcraft', novelCraftApi)` 暴露 API。
- `src/preload/api.ts` 定义 renderer 可调用的 `NovelCraftApi`：app 环境、project、chapter、ai。
- `src/shared/ipc/channels.ts` 集中维护 IPC channel 名称。
- `src/shared/schemas/*.schema.ts` 同时服务 main 校验和 renderer 类型引用。

新增跨进程能力时，按顺序更新 shared schema/channel、main IPC handler、preload API 类型与实现，再在 renderer 调用。

### Renderer

- `src/renderer/src/App.vue`：应用壳、左侧导航和顶部标题。
- `src/renderer/src/router/index.ts`：当前真实路由为首页、创作工作台、知识库。
- `src/renderer/src/views/HomeView.vue`：本机环境路径与入口。
- `src/renderer/src/views/WorkspaceView.vue`：作品/章节列表、Markdown 文本编辑和保存。
- `src/renderer/src/views/KnowledgeView.vue`：知识库页面框架。
- `src/renderer/src/components/ai/GeneratePanel.vue`：结构化 Mock AI 生成表单与结果纸条。
- `src/renderer/src/styles/main.css`：暖黄色/羊皮纸风格 token 与 Element Plus 覆盖。

当前 UI 设计稿中的扩展导航（人物与关系、记忆与一致性、AI 导演、导出、设置）属于设计预留，尚未全部落地到真实 Vue 路由。

## 数据与文件结构

默认运行时根目录在 `src/shared/constants/paths.ts`：

```text
F:/AINovelistData/workspace
F:/AINovelistData/knowledge_base
F:/AINovelistData/models
F:/AINovelistData/cache
```

每个作品目录由 repository 创建，结构为：

```text
{projectId}/
├── novel.json
├── characters.json
├── relations.json
├── timeline.json
├── plots.json
├── chapters/
├── chapters_meta/
├── memory/
├── config.json
└── .backup/
```

章节正文保存为 `chapters/{chapterId}.md`，章节元数据保存为 `chapters_meta/{chapterId}.json`。写入必须继续走 `fileStore` 的原子写入和备份逻辑，不要在业务代码中直接写文件绕过它。

## 测试布局

测试使用 Vitest，当前单元测试位于 `tests/unit/`，覆盖 schema、路径防护、原子文件写入、project repository 和 chapter repository。涉及文件系统的测试应使用临时目录或可控测试路径，不要写入真实作品数据。

## 设计资源

- `pen/pen.md`：UI 设计规范，要求中文主体、暖黄色/羊皮纸、低饱和、轻阴影、统一圆角、长文本优先。
- `pen/UI.pen`：Pencil 设计稿，包含 Tokens、Components、MVP 页面矩阵、Beta/Pro 预留页面和流程图。只能通过 Pencil MCP 工具读取、截图或修改。

## 本机环境基线

环境分析记录在 `docs/reports/2026-05-27-本机环境可行性分析报告.md`：Windows 11、Node.js v22.20.0、pnpm 11.3.0、Python 3.12.1、Visual Studio Build Tools 2022。Node 22 可用于 MVP；若 Electron 原生依赖、ONNX、SQLite 或打包异常，再准备 Node 20 LTS 对照验证。

## Git 与大文件规则

`.gitignore` 已排除依赖、构建产物、缓存、日志、本地运行数据、模型、向量索引、备份、安装包和 `.env`。不要提交本地作品数据、模型文件、缓存、API Key 或生成安装包。`.env.example` 可提交。
