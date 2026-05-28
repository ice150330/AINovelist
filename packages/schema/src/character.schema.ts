import { z } from 'zod'
import { safeIdSchema } from './chapter.schema'

export const characterRoleSchema = z.enum(['protagonist', 'supporting', 'antagonist', 'minor', 'other'])

export const characterSchema = z.object({
  schemaVersion: z.literal(1),
  id: safeIdSchema,
  name: z.string().min(1).max(80),
  role: characterRoleSchema.default('other'),
  aliases: z.array(z.string().min(1).max(80)).default([]),
  tags: z.array(z.string().min(1).max(32)).default([]),
  appearance: z.string().max(2000).default(''),
  motivation: z.string().max(2000).default(''),
  notes: z.string().max(5000).default(''),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const characterListSchema = z.array(characterSchema)

export const listCharactersInputSchema = z.object({
  projectId: safeIdSchema
})

export const createCharacterInputSchema = z.object({
  projectId: safeIdSchema,
  name: z.string().min(1).max(80),
  role: characterRoleSchema.default('other'),
  aliases: z.array(z.string().min(1).max(80)).default([]),
  tags: z.array(z.string().min(1).max(32)).default([]),
  appearance: z.string().max(2000).default(''),
  motivation: z.string().max(2000).default(''),
  notes: z.string().max(5000).default('')
})

export const updateCharacterInputSchema = createCharacterInputSchema.partial().extend({
  projectId: safeIdSchema,
  characterId: safeIdSchema
})

export const deleteCharacterInputSchema = z.object({
  projectId: safeIdSchema,
  characterId: safeIdSchema
})

export type CharacterRole = z.infer<typeof characterRoleSchema>
export type Character = z.infer<typeof characterSchema>
export type ListCharactersInput = z.infer<typeof listCharactersInputSchema>
export type CreateCharacterInput = z.infer<typeof createCharacterInputSchema>
export type UpdateCharacterInput = z.infer<typeof updateCharacterInputSchema>
export type DeleteCharacterInput = z.infer<typeof deleteCharacterInputSchema>
