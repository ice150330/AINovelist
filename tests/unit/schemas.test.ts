import { describe, expect, it } from 'vitest'
import { createProjectInputSchema, openProjectInputSchema, projectWorkspaceSchema } from '../../src/shared/schemas/project.schema'
import { createChapterInputSchema, readChapterInputSchema, saveChapterInputSchema } from '../../src/shared/schemas/chapter.schema'
import { writingRequestSchema } from '../../src/shared/schemas/ai.schema'

describe('schemas', () => {
  it('validates project creation input', () => {
    expect(createProjectInputSchema.parse({ name: '测试作品' })).toEqual({ name: '测试作品' })
  })

  it('rejects unsafe project ids', () => {
    expect(() => openProjectInputSchema.parse({ projectId: '../bad' })).toThrow()
  })

  it('validates chapter inputs', () => {
    expect(createChapterInputSchema.parse({ projectId: 'project_1', title: '第一章' })).toEqual({
      projectId: 'project_1',
      title: '第一章'
    })
    expect(readChapterInputSchema.parse({ projectId: 'project_1', chapterId: 'chapter_1' })).toEqual({
      projectId: 'project_1',
      chapterId: 'chapter_1'
    })
    expect(saveChapterInputSchema.parse({ projectId: 'project_1', chapterId: 'chapter_1', content: '# 正文' })).toEqual({
      projectId: 'project_1',
      chapterId: 'chapter_1',
      content: '# 正文'
    })
  })

  it('validates project workspace payload', () => {
    const now = new Date().toISOString()
    expect(
      projectWorkspaceSchema.parse({
        project: { schemaVersion: 1, id: 'project_1', name: '测试作品', createdAt: now, updatedAt: now },
        chapters: [{ schemaVersion: 1, id: 'chapter_1', title: '第一章', order: 0, createdAt: now, updatedAt: now }]
      })
    ).toMatchObject({ project: { id: 'project_1' }, chapters: [{ id: 'chapter_1' }] })
  })

  it('validates writing request defaults', () => {
    const request = writingRequestSchema.parse({
      intent: 'continue',
      sceneType: 'dialogue',
      mood: 'tense',
      pacing: 'normal',
      targetWords: 800
    })

    expect(request.requiredCharacterIds).toEqual([])
    expect(request.bannedCharacterIds).toEqual([])
    expect(request.knowledgeEntryIds).toEqual([])
  })
})
