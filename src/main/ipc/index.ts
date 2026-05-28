import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc/channels'
import { createProjectInputSchema, openProjectInputSchema } from '@shared/schemas/project.schema'
import { createChapterInputSchema, readChapterInputSchema, saveChapterInputSchema } from '@shared/schemas/chapter.schema'
import { writingRequestSchema } from '@shared/schemas/ai.schema'
import { getAppEnvironment } from '../services/pathService'
import { generateWithMockProvider } from '../providers/mockProvider'
import { createProject, listProjects, openProject } from '../services/projectService'
import { createChapter, readChapter, saveChapter } from '../services/chapterService'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.app.getEnvironment, () => getAppEnvironment())

  ipcMain.handle(IPC_CHANNELS.project.list, () => listProjects())

  ipcMain.handle(IPC_CHANNELS.project.create, (_event, input: unknown) => {
    return createProject(createProjectInputSchema.parse(input))
  })

  ipcMain.handle(IPC_CHANNELS.project.open, (_event, input: unknown) => {
    return openProject(openProjectInputSchema.parse(input))
  })

  ipcMain.handle(IPC_CHANNELS.chapter.create, (_event, input: unknown) => {
    return createChapter(createChapterInputSchema.parse(input))
  })

  ipcMain.handle(IPC_CHANNELS.chapter.read, (_event, input: unknown) => {
    return readChapter(readChapterInputSchema.parse(input))
  })

  ipcMain.handle(IPC_CHANNELS.chapter.save, (_event, input: unknown) => {
    return saveChapter(saveChapterInputSchema.parse(input))
  })

  ipcMain.handle(IPC_CHANNELS.ai.generate, async (_event, input: unknown) => {
    const request = writingRequestSchema.parse(input)
    return generateWithMockProvider(request)
  })
}
