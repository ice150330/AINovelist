<template>
  <section class="workspace-page">
    <aside class="workspace-panel shelf-panel">
      <div class="panel-heading">
        <p>作品目录</p>
        <h2>章节纸签</h2>
      </div>

      <form class="create-form" @submit.prevent="handleCreateProject">
        <NcInput v-model="newProjectName" placeholder="新作品名称" />
        <NcButton variant="primary" :loading="loading" @click="handleCreateProject">新建作品</NcButton>
      </form>

      <div class="section-divider">作品列表</div>
      <NcEmptyState v-if="projects.length === 0" description="还没有作品，先创建一个故事世界" />
      <div v-else class="project-list stagger-children">
        <NcProjectCard
          v-for="project in projects"
          :key="project.id"
          :name="project.name"
          :chapter-count="currentProject?.id === project.id ? chapters.length : undefined"
          :active="currentProject?.id === project.id"
          @click="handleOpenProject(project.id)"
        />
      </div>

      <template v-if="currentProject">
        <div class="section-divider">章节列表</div>
        <form class="create-form" @submit.prevent="handleCreateChapter">
          <NcInput v-model="newChapterTitle" placeholder="新章节标题" />
          <NcButton :loading="loading" @click="handleCreateChapter">新建章节</NcButton>
        </form>

        <NcEmptyState v-if="chapters.length === 0" description="这个作品还没有章节" />
        <div v-else class="menu-list stagger-children">
          <NcChapterTreeItem
            v-for="chapter in chapters"
            :key="chapter.id"
            :title="chapter.title"
            :active="currentChapter?.meta.id === chapter.id"
            @click="handleReadChapter(chapter.id)"
          />
        </div>
      </template>
    </aside>

    <main class="editor-panel">
      <div class="editor-paper">
        <header class="editor-header">
          <div>
            <p>{{ currentProject?.name ?? '尚未选择作品' }}</p>
            <h2>{{ currentChapter?.meta.title ?? 'Markdown 编辑器' }}</h2>
          </div>
          <NcButton
            variant="primary"
            :disabled="!currentChapter"
            :loading="saving"
            @click="handleSaveChapter"
          >保存章节</NcButton>
        </header>

        <NcAlert v-if="message" :type="messageType" closable @close="message = ''">{{ message }}</NcAlert>
        <NcEmptyState
          v-if="!currentProject"
          description="请先创建或选择一个作品，创作纸张会在这里展开"
        />
        <NcEmptyState
          v-else-if="!currentChapter"
          description="请新建或选择章节，然后开始写作"
        />
        <NcEditorTextarea
          v-else
          v-model="chapterContent"
          class="chapter-editor"
          placeholder="输入章节 Markdown 正文"
        />
      </div>
    </main>

    <aside class="workspace-panel assistant-panel">
      <div class="panel-heading">
        <p>AI 批注</p>
        <h2>生成面板</h2>
      </div>
      <GeneratePanel @apply="handleApplyGeneratedText" />
    </aside>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ChapterDocument, ChapterListItem } from '@shared/schemas/chapter.schema'
import type { Project, ProjectListItem } from '@shared/schemas/project.schema'
import NcInput from '../components/ui/NcInput.vue'
import NcButton from '../components/ui/NcButton.vue'
import NcEmptyState from '../components/ui/NcEmptyState.vue'
import NcAlert from '../components/ui/NcAlert.vue'
import NcEditorTextarea from '../components/ui/NcEditorTextarea.vue'
import NcProjectCard from '../components/ui/NcProjectCard.vue'
import NcChapterTreeItem from '../components/ui/NcChapterTreeItem.vue'
import GeneratePanel from '../components/ai/GeneratePanel.vue'

type MessageType = 'success' | 'warning' | 'info' | 'error'

const projects = ref<ProjectListItem[]>([])
const chapters = ref<ChapterListItem[]>([])
const currentProject = ref<Project | null>(null)
const currentChapter = ref<ChapterDocument | null>(null)
const chapterContent = ref('')
const newProjectName = ref('')
const newChapterTitle = ref('')
const loading = ref(false)
const saving = ref(false)
const message = ref('')
const messageType = ref<MessageType>('info')

onMounted(() => {
  void refreshProjects()
})

async function refreshProjects(): Promise<void> {
  projects.value = await window.novelcraft.project.list()
}

async function handleCreateProject(): Promise<void> {
  const name = newProjectName.value.trim()
  if (!name) {
    showMessage('请输入作品名称', 'warning')
    return
  }

  await runLoading(async () => {
    const workspace = await window.novelcraft.project.create({ name })
    currentProject.value = workspace.project
    chapters.value = workspace.chapters
    currentChapter.value = null
    chapterContent.value = ''
    newProjectName.value = ''
    await refreshProjects()
    showMessage('作品已创建', 'success')
  })
}

async function handleOpenProject(projectId: string): Promise<void> {
  await runLoading(async () => {
    const workspace = await window.novelcraft.project.open({ projectId })
    currentProject.value = workspace.project
    chapters.value = workspace.chapters
    currentChapter.value = null
    chapterContent.value = ''
    showMessage('作品已打开', 'success')
  })
}

async function handleCreateChapter(): Promise<void> {
  if (!currentProject.value) {
    showMessage('请先选择作品', 'warning')
    return
  }

  const title = newChapterTitle.value.trim()
  if (!title) {
    showMessage('请输入章节标题', 'warning')
    return
  }

  await runLoading(async () => {
    const chapter = await window.novelcraft.chapter.create({ projectId: currentProject.value!.id, title })
    currentChapter.value = chapter
    chapterContent.value = chapter.content
    newChapterTitle.value = ''
    await reloadCurrentProject()
    showMessage('章节已创建', 'success')
  })
}

async function handleReadChapter(chapterId: string): Promise<void> {
  if (!currentProject.value) {
    return
  }

  await runLoading(async () => {
    const chapter = await window.novelcraft.chapter.read({ projectId: currentProject.value!.id, chapterId })
    currentChapter.value = chapter
    chapterContent.value = chapter.content
    showMessage('章节已读取', 'success')
  })
}

async function handleSaveChapter(): Promise<void> {
  if (!currentProject.value || !currentChapter.value) {
    showMessage('请先选择章节', 'warning')
    return
  }

  saving.value = true
  try {
    const chapter = await window.novelcraft.chapter.save({
      projectId: currentProject.value.id,
      chapterId: currentChapter.value.meta.id,
      content: chapterContent.value
    })
    currentChapter.value = chapter
    await reloadCurrentProject()
    showMessage('章节已保存', 'success')
  } catch (error) {
    showMessage(error instanceof Error ? error.message : '章节保存失败', 'error')
  } finally {
    saving.value = false
  }
}

async function reloadCurrentProject(): Promise<void> {
  if (!currentProject.value) {
    return
  }

  const workspace = await window.novelcraft.project.open({ projectId: currentProject.value.id })
  currentProject.value = workspace.project
  chapters.value = workspace.chapters
  await refreshProjects()
}

async function runLoading(action: () => Promise<void>): Promise<void> {
  loading.value = true
  try {
    await action()
  } catch (error) {
    showMessage(error instanceof Error ? error.message : '操作失败', 'error')
  } finally {
    loading.value = false
  }
}

function handleApplyGeneratedText(text: string): void {
  if (!currentChapter.value) {
    showMessage('请先选择章节', 'warning')
    return
  }
  chapterContent.value += '\n\n' + text
  showMessage('已插入生成内容', 'success')
}

function showMessage(text: string, type: MessageType): void {
  message.value = text
  messageType.value = type
}
</script>

<style scoped>
.workspace-page {
  display: grid;
  grid-template-columns: minmax(240px, 0.72fr) minmax(420px, 1.6fr) minmax(280px, 0.9fr);
  gap: 18px;
  align-items: start;
}

.workspace-panel,
.editor-paper {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  background: rgba(255, 248, 232, 0.86);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(14px);
}

.workspace-panel {
  padding: 18px;
}

.shelf-panel {
  background: linear-gradient(180deg, rgba(255, 248, 232, 0.9), rgba(245, 223, 173, 0.64));
}

.assistant-panel {
  background: rgba(255, 248, 232, 0.72);
}

.panel-heading {
  margin-bottom: 16px;
}

.panel-heading p,
.editor-header p {
  margin: 0 0 4px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.panel-heading h2,
.editor-header h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.03em;
}

.create-form {
  display: grid;
  gap: 8px;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0 12px;
  color: var(--color-ink-faint);
  font-size: 12px;
  font-weight: 600;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.editor-panel {
  min-width: 0;
}

.editor-paper {
  min-height: calc(100vh - 136px);
  padding: 24px;
  background:
    linear-gradient(90deg, rgba(168, 111, 42, 0.04) 1px, transparent 1px),
    linear-gradient(180deg, #fffaf0 0%, var(--color-paper) 100%);
  background-size: 28px 28px, auto;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

:deep(.nc-alert) {
  margin-bottom: 12px;
}

.chapter-editor {
  min-height: 58vh;
}

.chapter-editor :deep(.nc-editor-textarea__field) {
  font-family: "Songti SC", "SimSun", "Noto Serif CJK SC", serif;
  font-size: 16px;
  line-height: 1.9;
  background: rgba(255, 252, 244, 0.9);
}

@media (max-width: 1280px) {
  .workspace-page {
    grid-template-columns: minmax(220px, 0.85fr) minmax(420px, 1.5fr);
  }

  .assistant-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .workspace-page {
    grid-template-columns: 1fr;
  }

  .editor-paper {
    min-height: auto;
  }
}
</style>
