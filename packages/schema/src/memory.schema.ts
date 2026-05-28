import { z } from 'zod'
import { safeIdSchema } from './chapter.schema'

export const hardConstraintSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  source: z.enum(['user', 'ai']).default('user')
})

export const chapterSummarySchema = z.object({
  chapterId: z.string().min(1),
  abstract: z.string().min(1),
  confirmedByUser: z.boolean().default(false)
})

export const hardConstraintListSchema = z.array(hardConstraintSchema)
export const chapterSummaryListSchema = z.array(chapterSummarySchema)

export const listMemoryInputSchema = z.object({
  projectId: safeIdSchema
})

export const createHardConstraintInputSchema = z.object({
  projectId: safeIdSchema,
  type: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  source: z.enum(['user', 'ai']).default('user')
})

export const deleteHardConstraintInputSchema = z.object({
  projectId: safeIdSchema,
  constraintId: z.string().min(1)
})

export const upsertChapterSummaryInputSchema = z.object({
  projectId: safeIdSchema,
  chapterId: safeIdSchema,
  abstract: z.string().min(1),
  confirmedByUser: z.boolean().default(false)
})

export type HardConstraint = z.infer<typeof hardConstraintSchema>
export type ChapterSummary = z.infer<typeof chapterSummarySchema>
export type ListMemoryInput = z.infer<typeof listMemoryInputSchema>
export type CreateHardConstraintInput = z.infer<typeof createHardConstraintInputSchema>
export type DeleteHardConstraintInput = z.infer<typeof deleteHardConstraintInputSchema>
export type UpsertChapterSummaryInput = z.infer<typeof upsertChapterSummaryInputSchema>
