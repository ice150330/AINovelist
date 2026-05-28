import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { invoke } from '@tauri-apps/api/core'
import type {
  AppEnvironment,
  Character,
  CharacterRole,
  ChapterDocument,
  ChapterMeta,
  ExportProjectResult,
  GenerateTextResult,
  HardConstraint,
  KnowledgeEntry,
  Project,
  ProjectWorkspace,
  WritingRequest
} from './types'
import './styles.css'

type View = 'home' | 'workspace' | 'characters' | 'knowledge' | 'memory' | 'ai' | 'export'

const roleLabels: Record<CharacterRole, string> = {
  protagonist: '主角',
  supporting: '配角',
  antagonist: '反派',
  minor: '次要',
  other: '其他'
}

function App() {
  const [view, setView] = useState<View>('home')
  const [projects, setProjects] = useState<Project[]>([])
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null)
  const [message, setMessage] = useState('')

  async function refreshProjects() {
    setProjects(await invoke<Project[]>('project_list'))
  }

  async function openProject(projectId: string) {
    const next = await invoke<ProjectWorkspace>('project_open', { input: { projectId } })
    setWorkspace(next)
  }

  useEffect(() => {
    void refreshProjects()
  }, [])

  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="brand">
          <span>NovelCraft</span>
          <strong>AI 小说创作工作台</strong>
        </div>
        {[
          ['home', '首页'],
          ['workspace', '创作工作台'],
          ['characters', '人物'],
          ['knowledge', '知识库'],
          ['memory', '记忆'],
          ['ai', 'AI 生成'],
          ['export', '导出']
        ].map(([id, label]) => (
          <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id as View)}>{label}</button>
        ))}
      </nav>
      <main className="content">
        {message && <div className="notice" onClick={() => setMessage('')}>{message}</div>}
        {view === 'home' && <Home />}
        {view === 'workspace' && <Workspace projects={projects} workspace={workspace} refreshProjects={refreshProjects} openProject={openProject} setWorkspace={setWorkspace} setMessage={setMessage} />}
        {view === 'characters' && <Characters projects={projects} setMessage={setMessage} />}
        {view === 'knowledge' && <Knowledge />}
        {view === 'memory' && <Memory projects={projects} setMessage={setMessage} />}
        {view === 'ai' && <AiPanel projects={projects} workspace={workspace} setMessage={setMessage} />}
        {view === 'export' && <Export projects={projects} setMessage={setMessage} />}
      </main>
    </div>
  )
}

function Home() {
  const [env, setEnv] = useState<AppEnvironment | null>(null)

  useEffect(() => {
    invoke<AppEnvironment>('app_get_environment').then(setEnv).catch(console.error)
  }, [])

  return (
    <section className="grid">
      <Panel className="hero">
        <p className="eyebrow">Tauri 2 应用</p>
        <h1>本地优先的长篇小说创作工作台。</h1>
        <p>当前版本使用 Tauri 2 + React 构建桌面端，AI 生成由 Python LLM 服务负责。</p>
      </Panel>
      <Panel>
        <h2>本机目录</h2>
        {env ? (
          <dl className="paths">
            <dt>作品空间</dt><dd>{env.workspacePath}</dd>
            <dt>知识库</dt><dd>{env.knowledgeBasePath}</dd>
            <dt>模型目录</dt><dd>{env.modelsPath}</dd>
            <dt>缓存目录</dt><dd>{env.cachePath}</dd>
          </dl>
        ) : <p>读取环境中...</p>}
      </Panel>
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

  async function createProject() {
    const next = await invoke<ProjectWorkspace>('project_create', { input: { name: projectName } })
    setWorkspace(next)
    setProjectName('')
    await refreshProjects()
    setMessage('作品已创建')
  }

  async function createChapter() {
    if (!workspace) return
    const next = await invoke<ChapterDocument>('chapter_create', { input: { projectId: workspace.project.id, title: chapterTitle } })
    setChapter(next)
    setContent(next.content)
    setChapterTitle('')
    await openProject(workspace.project.id)
    setMessage('章节已创建')
  }

  async function readChapter(chapterId: string) {
    if (!workspace) return
    const next = await invoke<ChapterDocument>('chapter_read', { input: { projectId: workspace.project.id, chapterId } })
    setChapter(next)
    setContent(next.content)
  }

  async function saveChapter() {
    if (!workspace || !chapter) return
    const next = await invoke<ChapterDocument>('chapter_save', { input: { projectId: workspace.project.id, chapterId: chapter.meta.id, content } })
    setChapter(next)
    await openProject(workspace.project.id)
    setMessage('章节已保存')
  }

  return (
    <section className="workspace">
      <Panel>
        <h2>作品</h2>
        <div className="row">
          <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="新作品名称" />
          <button onClick={createProject}>新建</button>
        </div>
        <div className="list">
          {projects.map((project) => <button key={project.id} className={workspace?.project.id === project.id ? 'active item' : 'item'} onClick={() => openProject(project.id)}>{project.name}</button>)}
        </div>
        {workspace && (
          <>
            <h3>章节</h3>
            <div className="row">
              <input value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} placeholder="新章节标题" />
              <button onClick={createChapter}>新建</button>
            </div>
            <div className="list">
              {workspace.chapters.map((item) => <button key={item.id} className={chapter?.meta.id === item.id ? 'active item' : 'item'} onClick={() => readChapter(item.id)}>{item.title}</button>)}
            </div>
          </>
        )}
      </Panel>
      <Panel className="editor">
        <div className="toolbar">
          <div>
            <p>{workspace?.project.name ?? '未选择作品'}</p>
            <h2>{chapter?.meta.title ?? 'Markdown 编辑器'}</h2>
          </div>
          <button disabled={!chapter} onClick={saveChapter}>保存</button>
        </div>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="输入章节正文" />
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
    await invoke<Character>('character_create', { input: { projectId, name, role, aliases: [], tags: splitWords(tags), appearance: '', motivation: '', notes: '' } })
    setName('')
    setTags('')
    await refresh()
    setMessage('人物已保存')
  }

  async function remove(characterId: string) {
    await invoke('character_delete', { input: { projectId, characterId } })
    await refresh()
  }

  return (
    <section className="grid">
      <Panel>
        <h2>人物列表</h2>
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        <div className="cards">
          {characters.map((character) => (
            <article key={character.id} className="card">
              <strong>{character.name}</strong>
              <span>{roleLabels[character.role]}</span>
              <p>{character.tags.join(' / ') || '无标签'}</p>
              <button onClick={() => remove(character.id)}>删除</button>
            </article>
          ))}
        </div>
      </Panel>
      <Panel>
        <h2>新建人物</h2>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="人物名称" />
        <select value={role} onChange={(event) => setRole(event.target.value as CharacterRole)}>
          {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="标签，用逗号或空格分隔" />
        <button disabled={!projectId || !name.trim()} onClick={create}>保存人物</button>
      </Panel>
    </section>
  )
}

function Knowledge() {
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState('')
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])

  async function search() {
    setEntries(await invoke<KnowledgeEntry[]>('knowledge_search', { input: { query, tags: splitWords(tags) } }))
  }

  useEffect(() => {
    void search()
  }, [])

  return (
    <section>
      <Panel>
        <h2>知识库</h2>
        <div className="row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="关键词" />
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="标签" />
          <button onClick={search}>搜索</button>
        </div>
      </Panel>
      <div className="cards">
        {entries.map((entry) => (
          <article key={entry.id} className="card">
            <strong>{entry.title}</strong>
            <span>{entry.category ?? '未分类'} · {entry.sourcePath ?? ''}</span>
            <p>{entry.excerpt}</p>
          </article>
        ))}
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

  return (
    <section className="grid">
      <Panel>
        <h2>硬约束</h2>
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        {constraints.map((item) => <article className="card" key={item.id}><strong>{item.priority}</strong><p>{item.content}</p></article>)}
      </Panel>
      <Panel>
        <h2>添加约束</h2>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="不可违背的设定" />
        <button disabled={!projectId || !content.trim()} onClick={create}>保存约束</button>
      </Panel>
    </section>
  )
}

function AiPanel({ projects, workspace, setMessage }: { projects: Project[]; workspace: ProjectWorkspace | null; setMessage: (message: string) => void }) {
  const defaultProjectId = workspace?.project.id ?? projects[0]?.id ?? ''
  const [projectId, setProjectId] = useState(defaultProjectId)
  const [note, setNote] = useState('')
  const [result, setResult] = useState<GenerateTextResult | null>(null)

  useEffect(() => {
    if (!projectId && defaultProjectId) setProjectId(defaultProjectId)
  }, [defaultProjectId, projectId])

  async function generate() {
    const request: WritingRequest = {
      projectId,
      intent: 'continue',
      sceneType: 'dialogue',
      mood: 'tense',
      pacing: 'normal',
      requiredCharacterIds: [],
      bannedCharacterIds: [],
      targetWords: 800,
      userNote: note,
      knowledgeEntryIds: []
    }
    const next = await invoke<GenerateTextResult>('ai_generate', { request })
    setResult(next)
    setMessage(`AI 生成完成：${next.provider}`)
  }

  return (
    <section className="grid">
      <Panel>
        <h2>Python LLM 生成</h2>
        <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="本次生成要求" />
        <button disabled={!projectId} onClick={generate}>生成正文</button>
      </Panel>
      <Panel className="prose">
        <h2>结果</h2>
        <pre>{result?.text ?? '生成结果会出现在这里。'}</pre>
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

  async function runExport() {
    const next = await invoke<ExportProjectResult>('export_project', { input: { projectId, format } })
    setResult(next)
    setMessage('作品已导出')
  }

  return (
    <Panel>
      <h2>导出作品</h2>
      <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
      <select value={format} onChange={(event) => setFormat(event.target.value as 'markdown' | 'txt')}>
        <option value="markdown">Markdown</option>
        <option value="txt">TXT</option>
      </select>
      <button disabled={!projectId} onClick={runExport}>开始导出</button>
      {result && <p className="path">已导出 {result.chapterCount} 章：{result.filePath}</p>}
    </Panel>
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

function splitWords(value: string): string[] {
  return value.split(/[，,\s]+/).map((item) => item.trim()).filter(Boolean)
}

createRoot(document.getElementById('root')!).render(<App />)
