import { readdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { chapterMetaSchema, type ChapterDocument, type ChapterMeta } from '@shared/schemas/chapter.schema'
import { ensureDir, readJson, readText, writeJsonAtomic, writeTextAtomic } from '../services/fileStore'
import {
  resolveChapterMarkdownPath,
  resolveChapterMetaPath,
  resolveInside,
  resolveProjectBackupPath,
  resolveProjectPath
} from '../services/pathService'

export async function listChapters(projectId: string): Promise<ChapterMeta[]> {
  const metaDir = resolveInside(resolveProjectPath(projectId), 'chapters_meta')
  await ensureDir(metaDir)
  const entries = await readdir(metaDir, { withFileTypes: true })
  const chapters = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => readJson(join(metaDir, entry.name), chapterMetaSchema))
  )

  return chapters.sort((left, right) => left.order - right.order)
}

export async function createChapter(projectId: string, meta: ChapterMeta, content = ''): Promise<ChapterDocument> {
  const projectPath = resolveProjectPath(projectId)
  await ensureDir(resolveInside(projectPath, 'chapters'))
  await ensureDir(resolveInside(projectPath, 'chapters_meta'))

  await writeJsonAtomic(resolveChapterMetaPath(projectId, meta.id), meta, resolveProjectBackupPath(projectId))
  await writeTextAtomic(resolveChapterMarkdownPath(projectId, meta.id), content, resolveProjectBackupPath(projectId))

  return { meta, content }
}

export async function readChapter(projectId: string, chapterId: string): Promise<ChapterDocument> {
  const meta = await readJson(resolveChapterMetaPath(projectId, chapterId), chapterMetaSchema)
  const content = await readText(resolveChapterMarkdownPath(projectId, chapterId))

  return { meta, content }
}

export async function saveChapter(projectId: string, chapterId: string, content: string): Promise<ChapterDocument> {
  const metaPath = resolveChapterMetaPath(projectId, chapterId)
  const meta = await readJson(metaPath, chapterMetaSchema)
  const updatedMeta: ChapterMeta = {
    ...meta,
    updatedAt: new Date().toISOString()
  }
  const backupDir = resolveProjectBackupPath(projectId)

  await writeTextAtomic(resolveChapterMarkdownPath(projectId, chapterId), content, backupDir)
  await writeJsonAtomic(metaPath, updatedMeta, backupDir)

  return { meta: updatedMeta, content }
}

export function chapterIdFromMetaFile(fileName: string): string {
  return basename(fileName, '.json')
}
