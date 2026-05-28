import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { invoke } from '@tauri-apps/api/core'
import {
  Archive,
  Bell,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Copy,
  Database,
  Download,
  Calendar,
  Eye,
  FileDown,
  FileSearch,
  FileText,
  FolderOpen,
  GitBranch,
  Home as HomeIcon,
  Layers,
  Link2,
  ListTree,
  LoaderCircle,
  Network,
  Palette,
  Plus,
  Route,
  Save,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquarePen,
  Tags,
  Trash2,
  UsersRound,
  WandSparkles,
  type LucideIcon
} from 'lucide-react'
import type {
  AppEnvironment,
  Character,
  CharacterRole,
  ChapterDocument,
  DatabaseStatus,
  DatabaseSyncResult,
  ExportProjectResult,
  GenerateTextResult,
  HardConstraint,
  KnowledgeEntry,
  Project,
  ProjectWorkspace,
  WritingRequest
} from './types'
import { LayoutControls } from './components/ui/LayoutControls'
import {
  normalizeUiPreferences,
  readUiPreferences,
  writeUiPreferences,
  type UiDensity,
  type UiPreferences,
  type UiScale
} from './uiPreferences'
import './styles.css'

type View =
  | 'home'
  | 'workspace'
  | 'characters'
  | 'knowledge'
  | 'memory'
  | 'timeline'
  | 'plot'
  | 'rag'
  | 'audit'
  | 'ai'
  | 'export'
  | 'components'
  | 'data'
  | 'settings'
type Tone = 'default' | 'accent' | 'success' | 'warning' | 'danger'
type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

const roleLabels: Record<CharacterRole, string> = {
  protagonist: '主角',
  supporting: '配角',
  antagonist: '反派',
  minor: '次要',
  other: '其他'
}

const navGroups: { label: string; items: { id: View; label: string; icon: LucideIcon; badge?: string }[] }[] = [
  {
    label: '创作',
    items: [
      { id: 'home', label: '首页', icon: HomeIcon },
      { id: 'workspace', label: '创作工作台', icon: SquarePen },
      { id: 'knowledge', label: '知识库', icon: BookOpen },
      { id: 'characters', label: '人物与关系', icon: UsersRound, badge: 'Beta' },
      { id: 'memory', label: '记忆与一致性', icon: Brain, badge: 'Beta' }
    ]
  },
  {
    label: '结构',
    items: [
      { id: 'timeline', label: '时间线', icon: Calendar, badge: 'Pro' },
      { id: 'plot', label: '情节脑图', icon: GitBranch, badge: 'Pro' },
      { id: 'rag', label: 'RAG 召回', icon: FileSearch, badge: 'Pro' },
      { id: 'audit', label: '一致性审查', icon: ShieldCheck, badge: 'Pro' }
    ]
  },
  {
    label: '辅助',
    items: [
      { id: 'ai', label: 'AI 导演', icon: WandSparkles, badge: 'Beta' },
      { id: 'export', label: '导出', icon: FileDown, badge: 'Beta' }
    ]
  },
  {
    label: '系统',
    items: [
      { id: 'components', label: '组件库', icon: Palette, badge: 'Design' },
      { id: 'data', label: '数据流程', icon: Database, badge: 'DB' },
      { id: 'settings', label: '设置', icon: Settings, badge: 'Local' }
    ]
  }
]

const viewMeta: Record<View, { title: string; subtitle: string; icon: LucideIcon }> = {
  home: { title: '首页', subtitle: '本机创作状态与最近作品', icon: HomeIcon },
  workspace: { title: '创作工作台', subtitle: '章节树、正文编辑和 AI 上下文', icon: SquarePen },
  characters: { title: '人物与关系', subtitle: '角色卡、标签和关系预览', icon: UsersRound },
  knowledge: { title: '知识库', subtitle: 'Markdown 素材检索与上下文召回', icon: BookOpen },
  memory: { title: '记忆与一致性', subtitle: '硬约束记忆和冲突审查', icon: Brain },
  timeline: { title: '时间线', subtitle: '事件排序、章节关联和伏笔回收', icon: Calendar },
  plot: { title: '情节脑图', subtitle: '主线、支线、冲突节点、伏笔与回收', icon: GitBranch },
  rag: { title: 'RAG 召回', subtitle: '本地索引状态、召回结果 Top-N 与模型状态', icon: FileSearch },
  audit: { title: '一致性审查', subtitle: '问题列表、严重程度、建议修复与一键加入记忆', icon: ShieldCheck },
  ai: { title: 'AI 导演', subtitle: 'Python LLM 服务生成正文', icon: WandSparkles },
  export: { title: '导出', subtitle: '导出前检查和本机文件输出', icon: FileDown },
  components: { title: '组件库', subtitle: 'UI.pen 组件在 React 中的落地样式', icon: Palette },
  data: { title: '数据流程', subtitle: '文件源、SQLite 镜像、同步状态与健康检查', icon: Database },
  settings: { title: '设置', subtitle: '本机目录、LLM 环境变量和运行状态', icon: Settings }
}

function App() {
  const [view, setView] = useState<View>('home')
  const [projects, setProjects] = useState<Project[]>([])
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null)
  const [message, setMessage] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(() => readUiPreferences())

  function patchUiPreferences(patch: Partial<UiPreferences>) {
    setUiPreferences((current) => {
      const next = normalizeUiPreferences({ ...current, ...patch })
      writeUiPreferences(next)
      return next
    })
  }

  async function refreshProjects() {
    setProjects(await invoke<Project[]>('project_list'))
  }

  async function openProject(projectId: string) {
    const next = await invoke<ProjectWorkspace>('project_open', { input: { projectId } })
    setWorkspace(next)
    setView('workspace')
  }

  useEffect(() => {
    void refreshProjects()
  }, [])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <div
      className={`app-shell ${uiPreferences.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      data-density={uiPreferences.density}
      data-scale={uiPreferences.scale}
    >
      <Sidebar
        view={view}
        setView={setView}
        collapsed={uiPreferences.sidebarCollapsed}
        onToggleCollapsed={() => patchUiPreferences({ sidebarCollapsed: !uiPreferences.sidebarCollapsed })}
      />
      <main className="app-main">
        <PageHeader
          view={view}
          workspace={workspace}
          uiPreferences={uiPreferences}
          onDensityChange={(density) => patchUiPreferences({ density })}
          onScaleChange={(scale) => patchUiPreferences({ scale })}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
        {message && <Notice message={message} onDismiss={() => setMessage('')} />}
        <div className="page-scroll">
          {view === 'home' && <Home projects={projects} workspace={workspace} openProject={openProject} setView={setView} />}
          {view === 'workspace' && (
            <Workspace
              projects={projects}
              workspace={workspace}
              refreshProjects={refreshProjects}
              openProject={openProject}
              setWorkspace={setWorkspace}
              setMessage={setMessage}
            />
          )}
          {view === 'characters' && <Characters projects={projects} setMessage={setMessage} />}
          {view === 'knowledge' && <Knowledge />}
          {view === 'memory' && <Memory projects={projects} setMessage={setMessage} />}
          {view === 'timeline' && <TimelinePage workspace={workspace} />}
          {view === 'plot' && <PlotPage workspace={workspace} />}
          {view === 'rag' && <RagPage />}
          {view === 'audit' && <AuditPage />}
          {view === 'ai' && <AiPanel projects={projects} workspace={workspace} setMessage={setMessage} />}
          {view === 'export' && <Export projects={projects} setMessage={setMessage} />}
          {view === 'components' && <ComponentLab />}
          {view === 'data' && <DataWorkflow setMessage={setMessage} />}
          {view === 'settings' && <SettingsView />}
        </div>
      </main>
      {commandOpen && (
        <CommandPalette
          projects={projects}
          workspace={workspace}
          currentView={view}
          setView={setView}
          openProject={openProject}
          onClose={() => setCommandOpen(false)}
        />
      )}
      {notificationsOpen && (
        <NotificationPanel
          projects={projects}
          workspace={workspace}
          onClose={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  )
}

function Sidebar({ view, setView, collapsed, onToggleCollapsed }: {
  view: View
  setView: (view: View) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">AI</div>
        <div className="brand-copy">
          <strong>AINovelist</strong>
          <span>温暖的 AI 小说创作台</span>
          <small>v0.3 Tauri</small>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
          title={collapsed ? '展开侧栏' : '折叠侧栏'}
          aria-label={collapsed ? '展开侧栏' : '折叠侧栏'}
          onClick={onToggleCollapsed}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {navGroups.map((group) => (
        <div className="nav-group" key={group.label}>
          <p>{group.label}</p>
          {group.items.map((item) => {
            const Icon = item.icon
            return (
              <button
                type="button"
                key={item.id}
                className={`nav-item ${view === item.id ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
                onClick={() => setView(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge && <em>{item.badge}</em>}
              </button>
            )
          })}
        </div>
      ))}
    </aside>
  )
}

function PageHeader({ view, workspace, uiPreferences, onDensityChange, onScaleChange, onOpenCommand, onOpenNotifications }: {
  view: View
  workspace: ProjectWorkspace | null
  uiPreferences: UiPreferences
  onDensityChange: (density: UiDensity) => void
  onScaleChange: (scale: UiScale) => void
  onOpenCommand: () => void
  onOpenNotifications: () => void
}) {
  const meta = viewMeta[view]
  const Icon = meta.icon
  const subtitle = view === 'workspace' && workspace ? `当前作品：《${workspace.project.name}》` : meta.subtitle

  return (
    <header className="page-header">
      <Icon size={24} />
      <div>
        <h1>{meta.title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions" aria-label="页面工具">
        <LayoutControls
          density={uiPreferences.density}
          scale={uiPreferences.scale}
          onDensityChange={onDensityChange}
          onScaleChange={onScaleChange}
        />
        <button type="button" className="icon-button" title="搜索 / 命令面板 Ctrl+K" onClick={onOpenCommand}>
          <Search size={18} />
        </button>
        <button type="button" className="icon-button" title="通知" onClick={onOpenNotifications}>
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}

function CommandPalette({ projects, workspace, currentView, setView, openProject, onClose }: {
  projects: Project[]
  workspace: ProjectWorkspace | null
  currentView: View
  setView: (view: View) => void
  openProject: (projectId: string) => Promise<void>
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const commands = [
    ...navGroups.flatMap((group) => group.items.map((item) => ({
      id: `view-${item.id}`,
      label: item.label,
      meta: `切换到${group.label} · ${viewMeta[item.id].subtitle}`,
      icon: item.icon,
      active: currentView === item.id,
      run: () => setView(item.id)
    }))),
    ...projects.slice(0, 8).map((project) => ({
      id: `project-${project.id}`,
      label: `打开《${project.name}》`,
      meta: `本机作品 · ${new Date(project.updatedAt).toLocaleString()}`,
      icon: FolderOpen,
      active: workspace?.project.id === project.id,
      run: () => openProject(project.id)
    }))
  ]
  const normalizedQuery = query.trim().toLowerCase()
  const filteredCommands = normalizedQuery
    ? commands.filter((command) => `${command.label} ${command.meta}`.toLowerCase().includes(normalizedQuery))
    : commands

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="overlay-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="command-palette" role="dialog" aria-label="命令面板" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-search">
          <Search size={18} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索页面、作品或功能" />
          <kbd>Esc</kbd>
        </div>
        <div className="command-list">
          {filteredCommands.slice(0, 12).map((command) => {
            const Icon = command.icon
            return (
              <button
                type="button"
                key={command.id}
                className={`command-item ${command.active ? 'active' : ''}`}
                onClick={() => {
                  void Promise.resolve(command.run()).finally(onClose)
                }}
              >
                <Icon size={17} />
                <span>
                  <strong>{command.label}</strong>
                  <small>{command.meta}</small>
                </span>
                {command.active && <StatusPill tone="accent" label="当前" />}
              </button>
            )
          })}
          {!filteredCommands.length && <EmptyState icon={Search} title="没有匹配命令" description="换一个关键词，或直接从左侧导航进入功能页。" />}
        </div>
      </section>
    </div>
  )
}

function NotificationPanel({ projects, workspace, onClose }: { projects: Project[]; workspace: ProjectWorkspace | null; onClose: () => void }) {
  const rows = [
    { tone: 'success' as Tone, title: '本机数据就绪', text: `已发现 ${projects.length} 个作品，当前数据写入本地目录。` },
    { tone: workspace ? 'accent' as Tone : 'warning' as Tone, title: workspace ? `当前作品：《${workspace.project.name}》` : '尚未打开作品', text: workspace ? `${workspace.chapters.length} 个章节可用于工作台、AI 生成和导出。` : '进入创作工作台后选择或新建作品。' },
    { tone: 'default' as Tone, title: '快捷键', text: 'Ctrl+K 打开命令面板；在工作台中 Ctrl+S 保存当前章节。' }
  ]

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="notification-drawer" role="dialog" aria-label="通知中心" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <p className="eyebrow">通知中心</p>
            <h2>运行状态</h2>
          </div>
          <button type="button" className="icon-button" aria-label="关闭通知" onClick={onClose}>×</button>
        </div>
        <div className="list-stack spacious">
          {rows.map((row) => <AuditItem key={row.title} tone={row.tone} title={row.title} text={row.text} />)}
        </div>
      </aside>
    </div>
  )
}

function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <button type="button" className="notice" onClick={onDismiss}>
      <CheckCircle2 size={18} />
      <span>{message}</span>
    </button>
  )
}

function Home({ projects, workspace, openProject, setView }: {
  projects: Project[]
  workspace: ProjectWorkspace | null
  openProject: (projectId: string) => Promise<void>
  setView: (view: View) => void
}) {
  const [env, setEnv] = useState<AppEnvironment | null>(null)

  useEffect(() => {
    invoke<AppEnvironment>('app_get_environment').then(setEnv).catch(console.error)
  }, [])

  const latestProject = workspace?.project ?? projects[0]

  return (
    <section className="home-layout">
      <div className="home-top">
        <Panel className="continue-card">
          <p className="eyebrow">继续写作</p>
          <h2>{latestProject?.name ?? '还没有作品'}</h2>
          <p>{latestProject ? '从上次保存的位置继续推进故事。' : '先创建一个作品，再开始铺开故事。'}</p>
          <div className="progress-track" aria-label="今日写作进度">
            <span style={{ width: `${latestProject ? 72 : 16}%` }} />
          </div>
          <div className="action-row">
            <Button icon={SquarePen} onClick={() => latestProject ? void openProject(latestProject.id) : setView('workspace')}>
              {latestProject ? '打开工作台' : '新建作品'}
            </Button>
            <Button variant="secondary" icon={BookOpen} onClick={() => setView('knowledge')}>
              查看知识库
            </Button>
          </div>
        </Panel>

        <Panel className="health-card">
          <SectionTitle title="今日写作与项目健康" icon={Sparkles} />
          <StatusLine tone="success" label="项目数据" value={`${projects.length} 个本机作品`} />
          <StatusLine tone="accent" label="运行架构" value="Tauri 2 · React · Python AI" />
          <StatusLine tone="warning" label="本机目录" value={env?.workspacePath ?? '读取中'} />
          <StatusLine tone="default" label="AI 服务" value="无 Key 时使用本地降级生成" />
        </Panel>
      </div>

      <div className="metric-grid">
        <MetricCard title="最近修改" value={latestProject?.name ?? '暂无'} meta={latestProject?.updatedAt ?? '创建作品后显示'} icon={FolderOpen} />
        <MetricCard title="章节进度" value={`${workspace?.chapters.length ?? 0} 章`} meta="当前打开作品" icon={FileText} />
        <MetricCard title="本机数据" value="Local-first" meta={env?.knowledgeBasePath ?? 'F:/AINovelistData'} icon={Database} />
      </div>

      <section className="section-block">
        <SectionTitle title="最近作品" icon={BookOpen} />
        <div className="project-strip">
          {projects.length ? projects.slice(0, 4).map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={() => void openProject(project.id)} />
          )) : (
            <EmptyState icon={SquarePen} title="还没有作品" description="在创作工作台中新建一个本机作品。" />
          )}
        </div>
      </section>
    </section>
  )
}

function Workspace({ projects, workspace, refreshProjects, openProject, setWorkspace, setMessage }: {
  projects: Project[]
  workspace: ProjectWorkspace | null
  refreshProjects: () => Promise<void>
  openProject: (projectId: string) => Promise<void>
  setWorkspace: (workspace: ProjectWorkspace | null) => void
  setMessage: (message: string) => void
}) {
  const [projectName, setProjectName] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapter, setChapter] = useState<ChapterDocument | null>(null)
  const [content, setContent] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [lastSavedAt, setLastSavedAt] = useState('')

  useEffect(() => {
    setChapter(null)
    setContent('')
    setSaveState('idle')
    setLastSavedAt('')
  }, [workspace?.project.id])

  async function createProject() {
    if (!projectName.trim()) return
    const next = await invoke<ProjectWorkspace>('project_create', { input: { name: projectName } })
    setWorkspace(next)
    setProjectName('')
    await refreshProjects()
    setMessage('作品已创建')
  }

  async function createChapter() {
    if (!workspace || !chapterTitle.trim()) return
    const next = await invoke<ChapterDocument>('chapter_create', { input: { projectId: workspace.project.id, title: chapterTitle } })
    setChapter(next)
    setContent(next.content)
    setSaveState('saved')
    setLastSavedAt(next.meta.updatedAt)
    setChapterTitle('')
    await openProject(workspace.project.id)
    setMessage('章节已创建')
  }

  async function readChapter(chapterId: string) {
    if (!workspace) return
    const next = await invoke<ChapterDocument>('chapter_read', { input: { projectId: workspace.project.id, chapterId } })
    setChapter(next)
    setContent(next.content)
    setSaveState('saved')
    setLastSavedAt(next.meta.updatedAt)
  }

  async function saveChapter() {
    if (!workspace || !chapter) return
    setSaveState('saving')
    try {
      const next = await invoke<ChapterDocument>('chapter_save', { input: { projectId: workspace.project.id, chapterId: chapter.meta.id, content } })
      setChapter(next)
      setSaveState('saved')
      setLastSavedAt(next.meta.updatedAt)
      await openProject(workspace.project.id)
      setMessage('章节已保存到本机')
    } catch (error) {
      setSaveState('error')
      setMessage(`保存失败：${String(error)}`)
    }
  }

  useEffect(() => {
    function handleSaveShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (chapter && saveState !== 'saving') void saveChapter()
      }
    }

    window.addEventListener('keydown', handleSaveShortcut)
    return () => window.removeEventListener('keydown', handleSaveShortcut)
  }, [workspace, chapter, content, saveState])

  const wordCount = countWords(content)
  const saveStatus = getSaveStatus(saveState, lastSavedAt)

  return (
    <section className="workspace-layout">
      <Panel className="chapter-shelf">
        <SectionTitle title="章节树" icon={BookOpen} compact />
        <FieldRow>
          <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="新作品名称" />
          <IconAction label="新建作品" icon={Plus} onClick={createProject} disabled={!projectName.trim()} />
        </FieldRow>
        <div className="list-stack">
          {projects.map((project) => (
            <button key={project.id} type="button" className={`list-item ${workspace?.project.id === project.id ? 'active' : ''}`} onClick={() => void openProject(project.id)}>
              <FolderOpen size={16} />
              <span>{project.name}</span>
            </button>
          ))}
        </div>

        {workspace && (
          <>
            <div className="divider" />
            <FieldRow>
              <input value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} placeholder="新章节标题" />
              <IconAction label="新建章节" icon={Plus} onClick={createChapter} disabled={!chapterTitle.trim()} />
            </FieldRow>
            <div className="chapter-list">
              {workspace.chapters.map((item) => (
                <button key={item.id} type="button" className={`chapter-item ${chapter?.meta.id === item.id ? 'active' : ''}`} onClick={() => void readChapter(item.id)}>
                  <span />
                  <strong>{item.title}</strong>
                  <small>第 {item.order + 1} 章 · 已保存</small>
                </button>
              ))}
              {!workspace.chapters.length && <EmptyState icon={FileText} title="还没有章节" description="新建一章，开始铺开故事。" />}
            </div>
          </>
        )}
      </Panel>

      <Panel className="editor-paper">
        <div className="editor-toolbar">
          <div>
            <p className="eyebrow">{workspace?.project.name ?? '未选择作品'}</p>
            <h2>{chapter?.meta.title ?? 'Markdown 编辑器'}</h2>
          </div>
          <div className="toolbar-actions">
            <StatusPill tone="success" label={`${wordCount} 字`} />
            <StatusPill tone={saveStatus.tone} label={saveStatus.label} />
            <Button icon={saveState === 'saving' ? LoaderCircle : Save} disabled={!chapter || saveState === 'saving'} onClick={saveChapter}>
              {saveState === 'saving' ? '保存中' : '保存'}
            </Button>
          </div>
        </div>
        <textarea
          className="chapter-editor"
          value={content}
          onChange={(event) => {
            setContent(event.target.value)
            if (chapter && saveState !== 'dirty') setSaveState('dirty')
          }}
          placeholder="输入章节正文。Markdown、对白、场景笔记都可以保存在这里。"
        />
        <div className="editor-footer">
          <span>正文</span>
          <span>Markdown</span>
          <span>Ctrl+S 保存</span>
          <span>{saveStatus.detail}</span>
        </div>
      </Panel>

      <Panel className="context-preview">
        <SectionTitle title="AI 上下文预览" icon={Sparkles} compact />
        <ContextRow label="POV" value="从角色设定中选择" />
        <ContextRow label="人物" value="人物页维护角色标签" />
        <ContextRow label="知识" value="知识库检索结果可参与生成" />
        <ContextRow label="硬约束" value="记忆页维护不可违背设定" />
        <div className="note-card">
          <strong>下一步建议</strong>
          <p>先完善人物动机和硬约束，再进入 AI 导演生成正文。</p>
        </div>
      </Panel>
    </section>
  )
}

function Characters({ projects, setMessage }: { projects: Project[]; setMessage: (message: string) => void }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [characters, setCharacters] = useState<Character[]>([])
  const [name, setName] = useState('')
  const [role, setRole] = useState<CharacterRole>('supporting')
  const [tags, setTags] = useState('')
  const selected = characters[0]

  useEffect(() => {
    if (!projectId && projects[0]) setProjectId(projects[0].id)
  }, [projects, projectId])

  async function refresh() {
    if (projectId) setCharacters(await invoke<Character[]>('character_list', { input: { projectId } }))
  }

  useEffect(() => {
    void refresh()
  }, [projectId])

  async function create() {
    await invoke<Character>('character_create', {
      input: { projectId, name, role, aliases: [], tags: splitWords(tags), appearance: '', motivation: '', notes: '' }
    })
    setName('')
    setTags('')
    await refresh()
    setMessage('人物已保存')
  }

  async function remove(characterId: string) {
    await invoke('character_delete', { input: { projectId, characterId } })
    await refresh()
    setMessage('人物已删除')
  }

  return (
    <section className="three-column-layout">
      <Panel>
        <SectionTitle title="人物列表" icon={UsersRound} compact />
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        <div className="list-stack spacious">
          {characters.map((character) => (
            <article key={character.id} className="character-row">
              <div>
                <strong>{character.name}</strong>
                <span>{roleLabels[character.role]}</span>
              </div>
              <Button variant="ghost" tone="danger" icon={Trash2} onClick={() => void remove(character.id)}>删除</Button>
            </article>
          ))}
          {!characters.length && <EmptyState icon={UsersRound} title="还没有人物" description="新建角色后会出现在这里。" />}
        </div>
      </Panel>

      <Panel className="character-detail">
        <SectionTitle title="人物详情" icon={FileText} compact />
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="人物名称" />
        <div className="form-grid">
          <select value={role} onChange={(event) => setRole(event.target.value as CharacterRole)}>
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="标签，用逗号或空格分隔" />
        </div>
        <Button icon={Plus} disabled={!projectId || !name.trim()} onClick={create}>保存人物</Button>
        {selected && (
          <div className="detail-card">
            <p className="eyebrow">当前角色</p>
            <h3>{selected.name}</h3>
            <p>{selected.tags.join(' / ') || '暂无标签'}</p>
          </div>
        )}
      </Panel>

      <Panel>
        <SectionTitle title="关系预览" icon={Sparkles} compact />
        <div className="relation-canvas">
          {characters.slice(0, 5).map((character, index) => (
            <span key={character.id} style={{ transform: `translate(${(index % 2) * 54}px, ${index * 36}px)` }}>{character.name.slice(0, 2)}</span>
          ))}
        </div>
        <StatusPill tone="accent" label="结构化关系图预留" />
      </Panel>
    </section>
  )
}

function Knowledge() {
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState('')
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null)
  const [contextEntries, setContextEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(false)

  async function search(nextQuery = query, nextTags = tags) {
    setLoading(true)
    try {
      const nextEntries = await invoke<KnowledgeEntry[]>('knowledge_search', { input: { query: nextQuery, tags: splitWords(nextTags) } })
      setEntries(nextEntries)
      setSelectedEntry((current) => {
        if (current && nextEntries.some((entry) => entry.id === current.id)) return current
        return nextEntries[0] ?? null
      })
    } finally {
      setLoading(false)
    }
  }

  function useTag(tag: string) {
    setQuery('')
    setTags(tag)
    void search('', tag)
  }

  function addToContext(entry: KnowledgeEntry) {
    setContextEntries((current) => current.some((item) => item.id === entry.id) ? current : [...current, entry])
  }

  useEffect(() => {
    void search()
  }, [])

  return (
    <section className="knowledge-layout">
      <Panel>
        <SectionTitle title="素材搜索" icon={Search} compact />
        <div className="search-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="关键词，例如：暗杀 兵器 夜间" />
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="标签" />
          <Button icon={Search} onClick={search}>搜索</Button>
        </div>
        <div className="tag-row">
          {['世界观', '人物', '文风', '理论'].map((tag) => <button type="button" key={tag} onClick={() => useTag(tag)}>{tag}</button>)}
        </div>
      </Panel>

      <div className="knowledge-grid">
        {loading && <SkeletonCard />}
        {!loading && entries.map((entry) => (
          <KnowledgeCard
            key={entry.id}
            entry={entry}
            selected={selectedEntry?.id === entry.id}
            onSelect={() => setSelectedEntry(entry)}
            onAddContext={() => addToContext(entry)}
          />
        ))}
        {!loading && !entries.length && <EmptyState icon={BookOpen} title="没有匹配素材" description="把 Markdown 放入知识库目录后再搜索。" />}
      </div>

      <div className="knowledge-bottom">
        <Panel>
          <SectionTitle title="Markdown 预览" icon={FileText} compact />
          {selectedEntry ? (
            <article className="knowledge-preview">
              <p className="eyebrow">{selectedEntry.category ?? '未分类'} · {selectedEntry.type ?? 'Markdown'}</p>
              <h3>{selectedEntry.title}</h3>
              <p>{selectedEntry.excerpt ?? '当前条目没有摘要，后续可接入正文读取。'}</p>
              <CodeList values={[selectedEntry.sourcePath ?? '本机知识库', ...(selectedEntry.tags.length ? selectedEntry.tags : ['暂无标签'])]} />
            </article>
          ) : (
            <p className="muted">选择知识卡后可在这里展示正文预览。当前版本先完成本机检索闭环。</p>
          )}
        </Panel>
        <Panel className="drop-panel">
          <Download size={24} />
          <strong>本次上下文篮</strong>
          <span>{contextEntries.length ? `已加入 ${contextEntries.length} 条素材，可作为 AI 召回上下文。` : '从上方卡片加入素材，后续会接入 AI 生成请求。'}</span>
          {contextEntries.length > 0 && (
            <div className="context-chip-list">
              {contextEntries.map((entry) => (
                <button type="button" key={entry.id} onClick={() => setContextEntries((current) => current.filter((item) => item.id !== entry.id))}>
                  {entry.title}
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </section>
  )
}

function Memory({ projects, setMessage }: { projects: Project[]; setMessage: (message: string) => void }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [constraints, setConstraints] = useState<HardConstraint[]>([])
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!projectId && projects[0]) setProjectId(projects[0].id)
  }, [projects, projectId])

  async function refresh() {
    if (projectId) setConstraints(await invoke<HardConstraint[]>('memory_list_hard_constraints', { input: { projectId } }))
  }

  useEffect(() => {
    void refresh()
  }, [projectId])

  async function create() {
    await invoke<HardConstraint>('memory_create_hard_constraint', { input: { projectId, type: 'continuity', content, priority: 'critical', source: 'user' } })
    setContent('')
    await refresh()
    setMessage('硬约束已保存')
  }

  async function remove(constraintId: string) {
    await invoke('memory_delete_hard_constraint', { input: { projectId, constraintId } })
    await refresh()
    setMessage('硬约束已移除')
  }

  return (
    <section className="three-column-layout">
      <Panel>
        <SectionTitle title="记忆筛选" icon={Brain} compact />
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        <Segmented values={['全部', '硬约束', '待确认']} />
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="不可违背的设定，例如：主角不能提前知道真相。" />
        <Button icon={Plus} disabled={!projectId || !content.trim()} onClick={create}>加入硬约束</Button>
      </Panel>

      <Panel>
        <SectionTitle title="硬约束记忆" icon={CheckCircle2} compact />
        <div className="list-stack spacious">
          {constraints.map((item) => (
            <article className="memory-card" key={item.id}>
              <StatusPill tone={item.priority === 'critical' ? 'danger' : 'warning'} label={item.priority} />
              <p>{item.content}</p>
              <Button variant="ghost" tone="danger" icon={Trash2} onClick={() => void remove(item.id)}>移除</Button>
            </article>
          ))}
          {!constraints.length && <EmptyState icon={Brain} title="暂无硬约束" description="保存硬约束后，AI 生成会读取这些规则。" />}
        </div>
      </Panel>

      <Panel>
        <SectionTitle title="一致性审查" icon={CircleAlert} compact />
        <AuditItem tone="danger" title="严重 · 角色已知信息冲突" text="生成内容前应检查硬约束与章节摘要。" />
        <AuditItem tone="warning" title="中等 · 时间线顺序不一致" text="后续可接入事件时间线和伏笔回收。" />
        <AuditItem tone="default" title="提示 · 伏笔尚未回收" text="当前页面先完成记忆写入和读取闭环。" />
      </Panel>
    </section>
  )
}

function TimelinePage({ workspace }: { workspace: ProjectWorkspace | null }) {
  const chapterEvents = workspace?.chapters.slice(0, 5).map((chapter, index) => ({
    title: `第 ${index + 1} 章 · ${chapter.title}`,
    meta: '关联章节 · 伏笔状态 · 可注入 Prompt',
    tone: index === 0 ? 'accent' as Tone : 'default' as Tone
  })) ?? []
  const events = [
    { title: '1842 · 雾都封城', meta: '时代背景 · 世界规则 · 城市封锁', tone: 'accent' as Tone },
    ...chapterEvents,
    { title: '第七章 · 伏笔回收', meta: '铜铃声 · 旧书店 · 角色认知翻转', tone: 'success' as Tone }
  ]

  return (
    <section className="timeline-layout">
      <Panel className="timeline-main">
        <SectionTitle title="事件排序" icon={Calendar} compact />
        <div className="timeline-rail">
          {events.map((event) => <TimelineItem key={event.title} {...event} />)}
        </div>
        <StatusPill tone="accent" label="Beta / Pro 能力 · 服务章节决策与 AI 导演上下文" />
      </Panel>

      <Panel className="timeline-side">
        <SectionTitle title="章节关联" icon={Link2} compact />
        <ContextRow label="主线轨道" value="无名书、旧书店、钟楼密谈" />
        <ContextRow label="人物轨道" value="林雾 / 沈砚 / 老钟表匠" />
        <ContextRow label="伏笔轨道" value="铜铃声、雾桥禁令、封城日" />
        <div className="note-card">
          <strong>设计稿映射</strong>
          <p>对应 UI.pen 的 screen/Timeline/Pro：事件卡片、圆点、章节关联和 Prompt 注入状态。</p>
        </div>
      </Panel>
    </section>
  )
}

function PlotPage({ workspace }: { workspace: ProjectWorkspace | null }) {
  const nodes = [
    { title: '主线：寻找无名书', icon: Route, tone: 'accent' as Tone },
    { title: '支线：钟楼继承权', icon: GitBranch, tone: 'default' as Tone },
    { title: '冲突：雾桥追逐', icon: Network, tone: 'warning' as Tone },
    { title: '伏笔：铜铃声', icon: Sparkles, tone: 'success' as Tone },
    { title: workspace?.project.name ? `作品：${workspace.project.name}` : '作品：未选择', icon: BookOpen, tone: 'default' as Tone }
  ]

  return (
    <section className="plot-layout">
      <Panel className="plot-canvas-panel">
        <SectionTitle title="情节脑图" icon={GitBranch} compact />
        <div className="plot-canvas">
          <div className="plot-center">
            <BookOpen size={24} />
            <strong>故事核心</strong>
            <span>秘密、选择、代价</span>
          </div>
          {nodes.map((node, index) => <PlotNode key={node.title} index={index} {...node} />)}
        </div>
      </Panel>

      <Panel>
        <SectionTitle title="节点拆解" icon={ListTree} compact />
        {nodes.map((node) => <AuditItem key={node.title} tone={node.tone} title={node.title} text="绑定章节、人物、知识条目和 AI 导演约束。" />)}
        <StatusPill tone="accent" label="结构化能力 · 主线 / 支线 / 冲突 / 伏笔" />
      </Panel>
    </section>
  )
}

function RagPage() {
  const [query, setQuery] = useState('蒸汽城邦 林雾 旧书店')
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])

  async function search() {
    setEntries(await invoke<KnowledgeEntry[]>('knowledge_search', { input: { query, tags: [] } }))
  }

  useEffect(() => {
    void search()
  }, [])

  const fallback = [
    { title: 'Top 1 · 蒸汽城邦地理', excerpt: '城市分为上层雾桥、中心钟楼区和下层机械巷。' },
    { title: 'Top 2 · 林雾人物小传', excerpt: '角色目标、恐惧和未知信息边界。' },
    { title: 'Top 3 · 旧书店文风样例', excerpt: '铜铃、黄昏、潮湿纸页与悬疑节奏。' }
  ]
  const results = entries.length ? entries.slice(0, 3).map((entry, index) => ({ title: `Top ${index + 1} · ${entry.title}`, excerpt: entry.excerpt ?? entry.sourcePath ?? 'Markdown 知识条目' })) : fallback

  return (
    <section className="rag-layout">
      <Panel>
        <SectionTitle title="ONNX RAG / 知识召回" icon={FileSearch} compact />
        <div className="search-row rag-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="召回查询" />
          <Button icon={Search} onClick={search}>召回</Button>
        </div>
        <div className="rag-status-card">
          <strong>索引状态：12,480 chunks · 本地模型就绪</strong>
          <p>MVP 后作为 Spike 验证，不阻塞基础创作。当前先复刻召回工作流和上下文注入位。</p>
          <div className="progress-track"><span style={{ width: '78%' }} /></div>
        </div>
      </Panel>

      <Panel className="rag-results">
        <SectionTitle title="召回结果 Top-N" icon={Database} compact />
        {results.map((result) => <RagResult key={result.title} title={result.title} excerpt={result.excerpt} />)}
        <div className="note-card emphasized">
          <strong>召回结果先进入 AI 导演上下文</strong>
          <p>作者可选择引用，不默认污染本次生成 Prompt。</p>
        </div>
      </Panel>
    </section>
  )
}

function AuditPage() {
  return (
    <section className="audit-layout">
      <Panel>
        <SectionTitle title="一致性问题列表" icon={ShieldCheck} compact />
        <ReviewIssue tone="danger" title="严重 · 角色已知信息冲突" evidence="林雾在第三章才知道旧书店真相，但当前生成片段提前揭示。" action="改写生成片段，或将此规则加入硬约束记忆。" />
        <ReviewIssue tone="warning" title="中等 · 时间线顺序不一致" evidence="钟楼密谈发生在雾桥追逐之后，当前章节引用顺序相反。" action="移动事件顺序，并同步章节摘要。" />
        <ReviewIssue tone="default" title="提示 · 伏笔尚未回收" evidence="铜铃声已出现 4 次，还没有明确回收计划。" action="加入情节脑图，标记预计回收章节。" />
      </Panel>

      <Panel className="audit-side">
        <SectionTitle title="作者确认入口" icon={CheckCircle2} compact />
        <MemoryConfirmCard />
        <div className="note-card emphasized">
          <strong>审查建议不是自动判定</strong>
          <p>证据、建议、确认入口分开呈现，避免误改正文。</p>
        </div>
      </Panel>
    </section>
  )
}

function AiPanel({ projects, workspace, setMessage }: { projects: Project[]; workspace: ProjectWorkspace | null; setMessage: (message: string) => void }) {
  const defaultProjectId = workspace?.project.id ?? projects[0]?.id ?? ''
  const [projectId, setProjectId] = useState(defaultProjectId)
  const [note, setNote] = useState('')
  const [targetWords, setTargetWords] = useState(800)
  const [sceneType, setSceneType] = useState<WritingRequest['sceneType']>('dialogue')
  const [mood, setMood] = useState<WritingRequest['mood']>('tense')
  const [pacing, setPacing] = useState<WritingRequest['pacing']>('normal')
  const [result, setResult] = useState<GenerateTextResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!projectId && defaultProjectId) setProjectId(defaultProjectId)
  }, [defaultProjectId, projectId])

  async function generate() {
    const request: WritingRequest = {
      projectId,
      intent: 'continue',
      sceneType,
      mood,
      pacing,
      requiredCharacterIds: [],
      bannedCharacterIds: [],
      targetWords,
      userNote: note,
      knowledgeEntryIds: []
    }
    setLoading(true)
    try {
      const next = await invoke<GenerateTextResult>('ai_generate', { request })
      setResult(next)
      setMessage(`AI 生成完成：${next.provider}`)
    } finally {
      setLoading(false)
    }
  }

  async function copyResult() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.text)
      setMessage('生成文本已复制')
    } catch (error) {
      setMessage(`复制失败：${String(error)}`)
    }
  }

  function reuseResultAsNote() {
    if (!result) return
    setNote(result.text.slice(0, 1200))
    setMessage('已将生成结果放入下一次生成要求')
  }

  return (
    <section className="ai-layout">
      <Panel>
        <SectionTitle title="结构化 Prompt" icon={WandSparkles} compact />
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        <div className="form-grid">
          <select value={sceneType} onChange={(event) => setSceneType(event.target.value as WritingRequest['sceneType'])}>
            <option value="dialogue">对话</option>
            <option value="action">动作</option>
            <option value="description">描写</option>
            <option value="transition">转场</option>
            <option value="monologue">独白</option>
          </select>
          <select value={mood} onChange={(event) => setMood(event.target.value as WritingRequest['mood'])}>
            <option value="tense">紧张</option>
            <option value="relaxed">舒缓</option>
            <option value="sad">悲伤</option>
            <option value="joyful">愉快</option>
            <option value="mysterious">神秘</option>
            <option value="violent">激烈</option>
          </select>
        </div>
        <div className="form-grid">
          <select value={pacing} onChange={(event) => setPacing(event.target.value as WritingRequest['pacing'])}>
            <option value="fast">快节奏</option>
            <option value="normal">正常</option>
            <option value="slow">慢节奏</option>
          </select>
          <input type="number" min={100} max={4000} value={targetWords} onChange={(event) => setTargetWords(Number(event.target.value))} />
        </div>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="本次生成要求，例如：写一段雨夜冲突，不要揭示真相。" />
        <Button icon={loading ? LoaderCircle : Sparkles} disabled={!projectId || loading} onClick={generate}>
          {loading ? '生成中' : '生成正文'}
        </Button>
      </Panel>

      <Panel className="result-panel">
        <SectionTitle title="结果复核" icon={FileText} compact />
        <article className="result-note">
          <strong>正文 · {result?.provider ?? '等待生成'}</strong>
          <pre>{result?.text ?? '生成结果会出现在这里。先选择作品并填写本次生成要求。'}</pre>
        </article>
        <div className="result-actions">
          <Button variant="secondary" icon={Copy} disabled={!result} onClick={copyResult}>复制正文</Button>
          <Button variant="secondary" icon={SquarePen} disabled={!result} onClick={reuseResultAsNote}>作为要求</Button>
          <Button variant="ghost" tone="danger" icon={Trash2} disabled={!result} onClick={() => setResult(null)}>清空</Button>
        </div>
        <div className="note-card">
          <strong>记忆入库建议</strong>
          <p>确认生成文本无冲突后，将关键设定写入硬约束或章节摘要。</p>
        </div>
      </Panel>
    </section>
  )
}

function Export({ projects, setMessage }: { projects: Project[]; setMessage: (message: string) => void }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [format, setFormat] = useState<'markdown' | 'txt'>('markdown')
  const [result, setResult] = useState<ExportProjectResult | null>(null)

  useEffect(() => {
    if (!projectId && projects[0]) setProjectId(projects[0].id)
  }, [projects, projectId])

  async function runExport(selectedFormat = format) {
    const next = await invoke<ExportProjectResult>('export_project', { input: { projectId, format: selectedFormat } })
    setFormat(selectedFormat)
    setResult(next)
    setMessage('作品已导出')
  }

  return (
    <section className="export-layout">
      <Panel>
        <SectionTitle title="导出目标" icon={Archive} compact />
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        <div className="export-options">
          <ExportOption title="Markdown 全书" description="适合后续编辑和版本管理" icon={FileText} active={format === 'markdown'} onClick={() => void runExport('markdown')} disabled={!projectId} />
          <ExportOption title="TXT 当前卷" description="适合阅读器和投稿前检查" icon={FileDown} active={format === 'txt'} onClick={() => void runExport('txt')} disabled={!projectId} />
          <ExportOption title="Word 模板" description="后续接入模板排版" icon={FileText} disabled />
          <ExportOption title="章节包" description="后续导出分章目录" icon={Archive} disabled />
        </div>
      </Panel>

      <Panel className="success-panel">
        <SectionTitle title={result ? '导出成功' : '导出前检查'} icon={CheckCircle2} compact />
        <ExportCheck title="项目可读取" meta={projectId ? '已选择本机作品' : '请选择作品'} ok={Boolean(projectId)} />
        <ExportCheck title="格式有效" meta={format.toUpperCase()} ok />
        <ExportCheck title="路径安全" meta="输出到作品 exports 目录" ok />
        {result && <p className="path-line">已导出 {result.chapterCount} 章：{result.filePath}</p>}
      </Panel>
    </section>
  )
}

function DataWorkflow({ setMessage }: { setMessage: (message: string) => void }) {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [syncResult, setSyncResult] = useState<DatabaseSyncResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function refreshStatus() {
    setStatus(await invoke<DatabaseStatus>('database_status'))
  }

  async function runSync() {
    setLoading(true)
    try {
      const next = await invoke<DatabaseSyncResult>('database_sync')
      setSyncResult(next)
      setStatus(next.status)
      setMessage('数据库同步完成')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshStatus()
  }, [])

  const effectiveStatus = syncResult?.status ?? status

  return (
    <section className="data-layout">
      <Panel className="data-overview">
        <SectionTitle title="SQLite 数据镜像" icon={Database} compact />
        <p className="muted">文件系统仍是可读源，SQLite 负责结构化索引、统计、健康检查和后续复杂查询。</p>
        <div className="action-row">
          <Button icon={loading ? LoaderCircle : Database} disabled={loading} onClick={runSync}>
            {loading ? '同步中' : '同步文件到数据库'}
          </Button>
          <Button variant="secondary" icon={Search} onClick={refreshStatus}>刷新状态</Button>
        </div>
        <div className="pipeline-strip">
          <PipelineStep title="文件源" text="novel.json / chapters / characters / memory / knowledge_base" />
          <PipelineStep title="SQLite 镜像" text="projects / chapters / characters / hard_constraints / knowledge_entries" />
          <PipelineStep title="查询能力" text="统计、检索、AI 上下文、后续关系图和一致性审查" />
        </div>
      </Panel>

      <div className="data-grid">
        <Panel>
          <SectionTitle title="数据库状态" icon={CheckCircle2} compact />
          <StatusLine tone="accent" label="Schema" value={`v${effectiveStatus?.schemaVersion ?? 0}`} />
          <StatusLine tone="success" label="作品" value={`${effectiveStatus?.projectCount ?? 0} 条`} />
          <StatusLine tone="success" label="章节" value={`${effectiveStatus?.chapterCount ?? 0} 条`} />
          <StatusLine tone="success" label="人物" value={`${effectiveStatus?.characterCount ?? 0} 条`} />
          <StatusLine tone="success" label="知识" value={`${effectiveStatus?.knowledgeCount ?? 0} 条`} />
          <StatusLine tone="warning" label="硬约束" value={`${effectiveStatus?.hardConstraintCount ?? 0} 条`} />
        </Panel>

        <Panel>
          <SectionTitle title="同步报告" icon={FileText} compact />
          {syncResult ? (
            <>
              <ExportCheck title="作品同步" meta={`${syncResult.syncedProjects} 个作品`} ok />
              <ExportCheck title="章节同步" meta={`${syncResult.syncedChapters} 个章节`} ok />
              <ExportCheck title="人物同步" meta={`${syncResult.syncedCharacters} 个人物`} ok />
              <ExportCheck title="知识同步" meta={`${syncResult.syncedKnowledge} 条知识`} ok />
              <ExportCheck title="硬约束同步" meta={`${syncResult.syncedHardConstraints} 条规则`} ok />
            </>
          ) : (
            <EmptyState icon={Database} title="等待同步" description="点击同步按钮后，这里会显示本次写入数据库的明细。" />
          )}
        </Panel>
      </div>

      <Panel className="data-path-panel">
        <SectionTitle title="数据库文件" icon={Archive} compact />
        <CodeList values={[effectiveStatus?.databasePath ?? '读取中', `最后同步：${effectiveStatus?.lastSyncedAt ? new Date(effectiveStatus.lastSyncedAt).toLocaleString() : '尚未同步'}`]} />
        {syncResult?.warnings.length ? (
          <div className="warning-list">
            {syncResult.warnings.map((warning) => <AuditItem key={warning} tone="warning" title="同步警告" text={warning} />)}
          </div>
        ) : (
          <p className="muted">同步流程只写入 SQLite 镜像，不删除或改写原始作品文件。</p>
        )}
      </Panel>
    </section>
  )
}

function PipelineStep({ title, text }: { title: string; text: string }) {
  return (
    <article className="pipeline-step">
      <strong>{title}</strong>
      <span>{text}</span>
    </article>
  )
}

function SettingsView() {
  const [env, setEnv] = useState<AppEnvironment | null>(null)

  useEffect(() => {
    invoke<AppEnvironment>('app_get_environment').then(setEnv).catch(console.error)
  }, [])

  return (
    <section className="settings-layout">
      <Panel>
        <SectionTitle title="本机目录" icon={Database} compact />
        <PathList env={env} />
      </Panel>
      <Panel>
        <SectionTitle title="LLM 环境变量" icon={Settings} compact />
        <CodeList values={['AINOVELIST_LLM_API_KEY', 'AINOVELIST_LLM_BASE_URL', 'AINOVELIST_LLM_MODEL', 'OPENAI_API_KEY']} />
      </Panel>
    </section>
  )
}

function ComponentLab() {
  return (
    <section className="component-lab">
      <Panel className="component-hero">
        <SectionTitle title="UI.pen 组件复刻面板" icon={Palette} compact />
        <p>这里把设计稿中的按钮、纸面面板、章节条目、知识卡、AI 结果、状态、加载、弹窗和下拉菜单集中落地，作为后续页面复用基线。</p>
      </Panel>

      <div className="component-grid">
        <Panel>
          <SectionTitle title="Actions" icon={Sparkles} compact />
          <div className="component-row">
            <Button icon={SquarePen}>开始创作</Button>
            <Button variant="secondary" icon={Eye}>查看详情</Button>
            <Button variant="ghost" tone="danger" icon={Trash2}>删除</Button>
          </div>
          <ToastPreview />
        </Panel>

        <Panel>
          <SectionTitle title="Navigation" icon={Layers} compact />
          <div className="component-nav-preview">
            {navGroups.flatMap((group) => group.items).slice(0, 6).map((item, index) => {
              const Icon = item.icon
              return <button type="button" className={`nav-item ${index === 1 ? 'active' : ''}`} key={item.id}><Icon size={16} /><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}</button>
            })}
          </div>
        </Panel>

        <Panel>
          <SectionTitle title="Cards" icon={BookOpen} compact />
          <ProjectCard project={{ schemaVersion: 1, id: 'demo', name: '雾都旧梦', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }} onOpen={() => undefined} />
          <KnowledgeCard entry={{ id: 'kb-demo', title: '世界观 · 蒸汽城邦', category: '世界观', tags: ['城市'], excerpt: '城市分为上层雾桥、中心钟楼区和下层机械巷。' }} />
        </Panel>

        <Panel>
          <SectionTitle title="Writing Widgets" icon={SquarePen} compact />
          <ChapterPreview title="第一章 旧书店" meta="约 2,480 字 · 已保存" active />
          <AiDirectorCard />
          <MemoryConfirmCard />
        </Panel>

        <Panel>
          <SectionTitle title="Feedback States" icon={CheckCircle2} compact />
          <StatusPill tone="success" label="作者已确认" />
          <StatusPill tone="warning" label="待确认" />
          <StatusPill tone="danger" label="严重冲突" />
          <LoadingBlock />
        </Panel>

        <Panel>
          <SectionTitle title="Overlays & Controls" icon={SlidersHorizontal} compact />
          <Segmented values={['全部', '待确认', '已确认']} />
          <DropdownPreview />
          <ModalPreview />
        </Panel>
      </div>
    </section>
  )
}

function TimelineItem({ title, meta, tone }: { title: string; meta: string; tone: Tone }) {
  return (
    <article className={`timeline-item ${tone}`}>
      <span />
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
    </article>
  )
}

function PlotNode({ title, icon: Icon, tone, index }: { title: string; icon: LucideIcon; tone: Tone; index: number }) {
  return (
    <article className={`plot-node node-${index} ${tone}`}>
      <Icon size={18} />
      <strong>{title}</strong>
    </article>
  )
}

function RagResult({ title, excerpt }: { title: string; excerpt: string }) {
  return (
    <article className="rag-result">
      <strong>{title}</strong>
      <p>{excerpt}</p>
      <Button variant="ghost" icon={Plus}>加入上下文</Button>
    </article>
  )
}

function ReviewIssue({ title, evidence, action, tone }: { title: string; evidence: string; action: string; tone: Tone }) {
  return (
    <article className={`review-issue ${tone}`}>
      <div>
        <StatusPill tone={tone} label={tone === 'danger' ? '严重' : tone === 'warning' ? '中等' : '提示'} />
        <strong>{title}</strong>
      </div>
      <p>{evidence}</p>
      <div className="issue-action">
        <span>{action}</span>
        <Button variant="secondary" icon={CheckCircle2}>确认处理</Button>
      </div>
    </article>
  )
}

function ChapterPreview({ title, meta, active }: { title: string; meta: string; active?: boolean }) {
  return (
    <article className={`chapter-preview ${active ? 'active' : ''}`}>
      <span />
      <div>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
    </article>
  )
}

function AiDirectorCard() {
  return (
    <article className="ai-director-card">
      <div className="metric-head">
        <Sparkles size={18} />
        <strong>AI 导演控制</strong>
      </div>
      <span>POV：林雾</span>
      <span>人物：沈砚 / 老钟表匠</span>
      <span>禁用：直接揭示真相</span>
      <span>目标：1200 字 · 悬疑推进</span>
    </article>
  )
}

function MemoryConfirmCard() {
  return (
    <article className="memory-confirm-card">
      <strong>待作者确认</strong>
      <p>AI 建议将“林雾尚不知道旧书店真相”写入硬约束记忆。</p>
      <div className="memory-actions">
        <Button icon={CheckCircle2}>确认入库</Button>
        <Button variant="secondary">稍后处理</Button>
      </div>
    </article>
  )
}

function ToastPreview() {
  return (
    <div className="toast-preview">
      <Sparkles size={18} />
      <span>章节已保存到本机</span>
      <button type="button" aria-label="关闭">×</button>
    </div>
  )
}

function LoadingBlock() {
  return (
    <div className="loading-block">
      <LoaderCircle className="spin" size={24} />
      <span />
      <span />
      <span />
    </div>
  )
}

function DropdownPreview() {
  return (
    <div className="dropdown-preview">
      <button type="button"><CheckCircle2 size={16} />按更新时间</button>
      <button type="button"><ClockIcon />按创建时间</button>
      <button type="button"><Tags size={16} />按名称排序</button>
      <hr />
      <button type="button" className="muted-action"><Trash2 size={16} />移至回收站</button>
    </div>
  )
}

function ClockIcon() {
  return <Calendar size={16} />
}

function ModalPreview() {
  return (
    <div className="modal-preview">
      <strong>确认删除章节？</strong>
      <p>此操作不可撤销，章节正文与元数据将被永久删除。</p>
      <div className="modal-actions-preview">
        <Button variant="secondary">取消</Button>
        <Button tone="danger" icon={Trash2}>删除</Button>
      </div>
    </div>
  )
}

function ProjectSelect({ projects, value, onChange }: { projects: Project[]; value: string; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">选择作品</option>
      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
    </select>
  )
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>
}

function SectionTitle({ title, icon: Icon, compact = false }: { title: string; icon: LucideIcon; compact?: boolean }) {
  return (
    <div className={`section-title ${compact ? 'compact' : ''}`}>
      <Icon size={compact ? 18 : 22} />
      <div>
        <h2>{title}</h2>
      </div>
    </div>
  )
}

function Button({ children, icon: Icon, variant = 'primary', tone = 'default', disabled, onClick }: {
  children: React.ReactNode
  icon?: LucideIcon
  variant?: 'primary' | 'secondary' | 'ghost'
  tone?: Tone
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button type="button" className={`btn ${variant} ${tone}`} disabled={disabled} onClick={onClick}>
      {Icon && <Icon size={16} className={Icon === LoaderCircle ? 'spin' : ''} />}
      <span>{children}</span>
    </button>
  )
}

function IconAction({ label, icon: Icon, disabled, onClick }: { label: string; icon: LucideIcon; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="icon-action" title={label} aria-label={label} disabled={disabled} onClick={onClick}>
      <Icon size={17} />
    </button>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="field-row">{children}</div>
}

function StatusLine({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className="status-line">
      <StatusPill tone={tone} label={label} />
      <span>{value}</span>
    </div>
  )
}

function StatusPill({ label, tone = 'default' }: { label: string; tone?: Tone }) {
  return <span className={`status-pill ${tone}`}>{label}</span>
}

function MetricCard({ title, value, meta, icon: Icon }: { title: string; value: string; meta: string; icon: LucideIcon }) {
  return (
    <Panel className="metric-card">
      <div className="metric-head">
        <Icon size={18} />
        <strong>{title}</strong>
      </div>
      <b>{value}</b>
      <span>{meta}</span>
    </Panel>
  )
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article className="project-card">
      <strong>{project.name}</strong>
      <span>本机作品 · {new Date(project.updatedAt).toLocaleString()}</span>
      <button type="button" onClick={onOpen}>继续创作 <ChevronRight size={15} /></button>
    </article>
  )
}

function KnowledgeCard({ entry, selected, onSelect, onAddContext }: {
  entry: KnowledgeEntry
  selected?: boolean
  onSelect?: () => void
  onAddContext?: () => void
}) {
  return (
    <article className={`knowledge-card ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <strong>{entry.title}</strong>
      <span>{entry.category ?? '未分类'} · {entry.sourcePath ?? 'Markdown'}</span>
      <p>{entry.excerpt}</p>
      <button type="button" onClick={(event) => {
        event.stopPropagation()
        onAddContext?.()
      }}>加入上下文 <ChevronRight size={15} /></button>
    </article>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="empty-state">
      <Icon size={26} />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  )
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="context-row">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  )
}

function Segmented({ values }: { values: string[] }) {
  return (
    <div className="segmented">
      {values.map((value, index) => <button type="button" key={value} className={index === 0 ? 'active' : ''}>{value}</button>)}
    </div>
  )
}

function AuditItem({ title, text, tone }: { title: string; text: string; tone: Tone }) {
  return (
    <article className={`audit-item ${tone}`}>
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  )
}

function ExportOption({ title, description, icon: Icon, active, disabled, onClick }: {
  title: string
  description: string
  icon: LucideIcon
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button type="button" className={`export-option ${active ? 'active' : ''}`} disabled={disabled} onClick={onClick}>
      <Icon size={20} />
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  )
}

function ExportCheck({ title, meta, ok }: { title: string; meta: string; ok: boolean }) {
  return (
    <article className="export-check">
      {ok ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return (
    <article className="skeleton-card">
      <span />
      <span />
      <span />
      <span />
    </article>
  )
}

function PathList({ env }: { env: AppEnvironment | null }) {
  const rows = env ? [
    ['作品空间', env.workspacePath],
    ['知识库', env.knowledgeBasePath],
    ['SQLite 数据库', env.databasePath],
    ['模型目录', env.modelsPath],
    ['缓存目录', env.cachePath]
  ] : [['环境', '读取中']]
  return (
    <dl className="path-list">
      {rows.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

function CodeList({ values }: { values: string[] }) {
  return <div className="code-list">{values.map((value) => <code key={value}>{value}</code>)}</div>
}

function splitWords(value: string): string[] {
  return value.split(/[，,\s]+/).map((item) => item.trim()).filter(Boolean)
}

function countWords(value: string): number {
  return value.replace(/\s/g, '').length
}

function getSaveStatus(saveState: SaveState, lastSavedAt: string): { label: string; detail: string; tone: Tone } {
  if (saveState === 'dirty') return { label: '未保存', detail: '有未保存修改', tone: 'warning' }
  if (saveState === 'saving') return { label: '保存中', detail: '正在写入本机文件', tone: 'accent' }
  if (saveState === 'error') return { label: '保存失败', detail: '请检查本机目录权限后重试', tone: 'danger' }
  if (saveState === 'saved') {
    return {
      label: '已保存',
      detail: lastSavedAt ? `最后保存 ${new Date(lastSavedAt).toLocaleString()}` : '已写入本机文件',
      tone: 'success'
    }
  }
  return { label: '未选择章节', detail: '选择章节后开始编辑', tone: 'default' }
}

createRoot(document.getElementById('root')!).render(<App />)
