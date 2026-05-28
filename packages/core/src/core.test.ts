import { describe, expect, it } from 'vitest'
import { chapterMetaSchema, projectSchema } from '@ainovelist/schema'
import { createChapterMeta, createProjectEntity, createSafeId, touchProject } from './index'

describe('core entities', () => {
  it('creates schema-valid project entities', () => {
    const project = createProjectEntity({ name: '  长夜计划  ' }, new Date('2026-05-28T00:00:00.000Z'))

    expect(projectSchema.parse(project)).toEqual(project)
    expect(project.name).toBe('长夜计划')
    expect(project.createdAt).toBe('2026-05-28T00:00:00.000Z')
  })

  it('creates schema-valid chapter metadata', () => {
    const chapter = createChapterMeta({ title: '  第一章  ', order: 0 }, new Date('2026-05-28T00:00:00.000Z'))

    expect(chapterMetaSchema.parse(chapter)).toEqual(chapter)
    expect(chapter.title).toBe('第一章')
    expect(chapter.order).toBe(0)
  })

  it('uses safe generated ids', () => {
    expect(createSafeId('bad prefix', 1, 'abc.def')).toBe('bad_prefix_1_abcdef')
  })

  it('touches projects without mutating identity fields', () => {
    const project = createProjectEntity({ name: '测试' }, new Date('2026-05-28T00:00:00.000Z'))
    const touched = touchProject(project, new Date('2026-05-29T00:00:00.000Z'))

    expect(touched.id).toBe(project.id)
    expect(touched.createdAt).toBe(project.createdAt)
    expect(touched.updatedAt).toBe('2026-05-29T00:00:00.000Z')
  })
})
