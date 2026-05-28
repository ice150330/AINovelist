import { z } from 'zod'

export const knowledgeEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  type: z.string().optional(),
  sourcePath: z.string().optional(),
  excerpt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const knowledgeSearchInputSchema = z.object({
  query: z.string().default(''),
  tags: z.array(z.string()).default([]),
  category: z.string().optional()
})

export type KnowledgeEntry = z.infer<typeof knowledgeEntrySchema>
export type KnowledgeSearchInput = z.infer<typeof knowledgeSearchInputSchema>
