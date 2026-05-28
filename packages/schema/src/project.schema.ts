import { z } from 'zod'
import { chapterListItemSchema, safeIdSchema } from './chapter.schema'

export const projectSchema = z.object({
  schemaVersion: z.literal(1),
  id: safeIdSchema,
  name: z.string().min(1).max(80),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const projectListItemSchema = projectSchema

export const createProjectInputSchema = z.object({
  name: z.string().min(1).max(80)
})

export const openProjectInputSchema = z.object({
  projectId: safeIdSchema
})

export const projectWorkspaceSchema = z.object({
  project: projectSchema,
  chapters: z.array(chapterListItemSchema)
})

export type Project = z.infer<typeof projectSchema>
export type ProjectListItem = z.infer<typeof projectListItemSchema>
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>
export type OpenProjectInput = z.infer<typeof openProjectInputSchema>
export type ProjectWorkspace = z.infer<typeof projectWorkspaceSchema>
