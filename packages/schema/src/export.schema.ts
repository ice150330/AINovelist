import { z } from 'zod'
import { safeIdSchema } from './chapter.schema'

export const exportFormatSchema = z.enum(['markdown', 'txt'])

export const exportProjectInputSchema = z.object({
  projectId: safeIdSchema,
  format: exportFormatSchema
})

export const exportProjectResultSchema = z.object({
  filePath: z.string().min(1),
  format: exportFormatSchema,
  chapterCount: z.number().int().nonnegative(),
  exportedAt: z.string().datetime()
})

export type ExportFormat = z.infer<typeof exportFormatSchema>
export type ExportProjectInput = z.infer<typeof exportProjectInputSchema>
export type ExportProjectResult = z.infer<typeof exportProjectResultSchema>
