import { z } from 'zod'

export const writingRequestSchema = z.object({
  projectId: z.string().optional(),
  intent: z.enum(['continue', 'rewrite', 'expand', 'outline_branch', 'scene_script']),
  povCharacterId: z.string().optional(),
  sceneType: z.enum(['dialogue', 'action', 'description', 'transition', 'monologue']),
  mood: z.enum(['tense', 'relaxed', 'sad', 'joyful', 'mysterious', 'violent']),
  pacing: z.enum(['fast', 'normal', 'slow']),
  requiredCharacterIds: z.array(z.string()).default([]),
  bannedCharacterIds: z.array(z.string()).default([]),
  plotId: z.string().optional(),
  targetWords: z.number().int().positive().max(10000),
  userNote: z.string().optional(),
  knowledgeEntryIds: z.array(z.string()).default([])
})

export const generateTextResultSchema = z.object({
  text: z.string(),
  provider: z.string(),
  createdAt: z.string().datetime(),
})

export type WritingRequest = z.infer<typeof writingRequestSchema>
export type GenerateTextResult = z.infer<typeof generateTextResultSchema>
