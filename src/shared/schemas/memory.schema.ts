import { z } from 'zod'

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

export type HardConstraint = z.infer<typeof hardConstraintSchema>
export type ChapterSummary = z.infer<typeof chapterSummarySchema>
