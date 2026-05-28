import type { ChapterMeta } from '@ainovelist/schema'
import { createSafeId } from './ids'

export interface CreateChapterMetaInput {
  title: string
  order: number
}

export function createChapterMeta(input: CreateChapterMetaInput, at = new Date()): ChapterMeta {
  const now = at.toISOString()

  return {
    schemaVersion: 1,
    id: createSafeId('chapter'),
    title: input.title.trim(),
    order: input.order,
    createdAt: now,
    updatedAt: now
  }
}

export function touchChapterMeta(meta: ChapterMeta, at = new Date()): ChapterMeta {
  return {
    ...meta,
    updatedAt: at.toISOString()
  }
}
