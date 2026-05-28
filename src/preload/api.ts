import { ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc/channels'
import type { WritingRequest, GenerateTextResult } from '@shared/schemas/ai.schema'
import type { CreateProjectInput, OpenProjectInput, ProjectListItem, ProjectWorkspace } from '@shared/schemas/project.schema'
import type { ChapterDocument, CreateChapterInput, ReadChapterInput, SaveChapterInput } from '@shared/schemas/chapter.schema'

export interface NovelCraftApi {
  app: {
    getEnvironment: () => Promise<{
      workspacePath: string
      knowledgeBasePath: string
      modelsPath: string
      cachePath: string
    }>
  }
  project: {
    list: () => Promise<ProjectListItem[]>
    create: (input: CreateProjectInput) => Promise<ProjectWorkspace>
    open: (input: OpenProjectInput) => Promise<ProjectWorkspace>
  }
  chapter: {
    create: (input: CreateChapterInput) => Promise<ChapterDocument>
    read: (input: ReadChapterInput) => Promise<ChapterDocument>
    save: (input: SaveChapterInput) => Promise<ChapterDocument>
  }
  ai: {
    generate: (request: WritingRequest) => Promise<GenerateTextResult>
  }
}

export const novelCraftApi: NovelCraftApi = {
  app: {
    getEnvironment: () => ipcRenderer.invoke(IPC_CHANNELS.app.getEnvironment)
  },
  project: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.project.list),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.project.create, input),
    open: (input) => ipcRenderer.invoke(IPC_CHANNELS.project.open, input)
  },
  chapter: {
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.chapter.create, input),
    read: (input) => ipcRenderer.invoke(IPC_CHANNELS.chapter.read, input),
    save: (input) => ipcRenderer.invoke(IPC_CHANNELS.chapter.save, input)
  },
  ai: {
    generate: (request) => ipcRenderer.invoke(IPC_CHANNELS.ai.generate, request)
  }
}
