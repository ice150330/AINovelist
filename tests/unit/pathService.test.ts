import { describe, expect, it } from 'vitest'
import { assertSafeId, resolveChapterMarkdownPath, resolveInside, resolveProjectPath } from '../../src/main/services/pathService'

describe('pathService', () => {
  it('accepts safe ids', () => {
    expect(assertSafeId('project_123-abc')).toBe('project_123-abc')
  })

  it('rejects unsafe ids', () => {
    for (const id of ['', '../bad', 'bad/name', 'bad\\name', 'C:/bad', 'bad.name']) {
      expect(() => assertSafeId(id)).toThrow()
    }
  })

  it('rejects paths outside root', () => {
    expect(() => resolveInside('F:/AINovelistData/workspace', '../../escape')).toThrow()
  })

  it('resolves project and chapter paths inside workspace', () => {
    expect(resolveProjectPath('project_1')).toContain('AINovelistData')
    expect(resolveChapterMarkdownPath('project_1', 'chapter_1')).toContain('chapters')
  })
})
