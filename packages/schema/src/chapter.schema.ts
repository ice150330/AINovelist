import { z } from 'zod'

export const safeIdSchema = z.string().regex(/^[A-Za-z0-9_-]+$/)

export const chapterMetaSchema = z.object({
  schemaVersion: z.literal(1),
  id: safeIdSchema,
  title: z.string().min(1).max(120),
  order: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const chapterListItemSchema = chapterMetaSchema

export const createChapterInputSchema = z.object({
  projectId: safeIdSchema,
  title: z.string().min(1).max(120)
})

export const readChapterInputSchema = z.object({
  projectId: safeIdSchema,
  chapterId: safeIdSchema
})

export const saveChapterInputSchema = z.object({
  projectId: safeIdSchema,
  chapterId: safeIdSchema,
  content: z.string()
})

export const chapterDocumentSchema = z.object({
  meta: chapterMetaSchema,
  content: z.string()
})

export type ChapterMeta = z.infer<typeof chapterMetaSchema>
export type ChapterListItem = z.infer<typeof chapterListItemSchema>
export type CreateChapterInput = z.infer<typeof createChapterInputSchema>
export type ReadChapterInput = z.infer<typeof readChapterInputSchema>
export type SaveChapterInput = z.infer<typeof saveChapterInputSchema>
export type ChapterDocument = z.infer<typeof chapterDocumentSchema>
