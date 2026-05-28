import type { ChapterDocument, ChapterMeta, CreateChapterInput, ReadChapterInput, SaveChapterInput } from '@shared/schemas/chapter.schema'
import { createChapter as createChapterRecord, listChapters, readChapter as readChapterRecord, saveChapter as saveChapterRecord } from '../repositories/chapterRepository'
import { openProject, updateProject } from '../repositories/projectRepository'

export async function createChapter(input: CreateChapterInput): Promise<ChapterDocument> {
  const workspace = await openProject(input.projectId)
  const now = new Date().toISOString()
  const meta: ChapterMeta = {
    schemaVersion: 1,
    id: createId('chapter'),
    title: input.title.trim(),
    order: workspace.chapters.length,
    createdAt: now,
    updatedAt: now
  }
  const chapter = await createChapterRecord(input.projectId, meta)

  await updateProject({
    ...workspace.project,
    updatedAt: now
  })

  return chapter
}

export async function readChapter(input: ReadChapterInput): Promise<ChapterDocument> {
  return readChapterRecord(input.projectId, input.chapterId)
}

export async function saveChapter(input: SaveChapterInput): Promise<ChapterDocument> {
  const chapter = await saveChapterRecord(input.projectId, input.chapterId, input.content)
  const workspace = await openProject(input.projectId)

  await updateProject({
    ...workspace.project,
    updatedAt: chapter.meta.updatedAt
  })

  return chapter
}

export { listChapters }

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
