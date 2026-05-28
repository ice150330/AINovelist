import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let root: string

vi.mock('../../src/shared/constants/paths', () => ({
  DEFAULT_DATA_ROOT: root,
  DEFAULT_PATHS: {
    get workspace() {
      return join(root, 'workspace')
    },
    get knowledgeBase() {
      return join(root, 'knowledge_base')
    },
    get models() {
      return join(root, 'models')
    },
    get cache() {
      return join(root, 'cache')
    }
  }
}))

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'ainovelist-chapter-'))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('chapterRepository', () => {
  it('creates, reads, lists and saves chapters', async () => {
    const { createProject } = await import('../../src/main/repositories/projectRepository')
    const { createChapter, listChapters, readChapter, saveChapter } = await import('../../src/main/repositories/chapterRepository')
    const now = new Date().toISOString()

    await createProject({
      schemaVersion: 1,
      id: 'project_1',
      name: '测试作品',
      createdAt: now,
      updatedAt: now
    })

    await createChapter('project_1', {
      schemaVersion: 1,
      id: 'chapter_1',
      title: '第一章',
      order: 0,
      createdAt: now,
      updatedAt: now
    })

    await expect(listChapters('project_1')).resolves.toMatchObject([{ id: 'chapter_1', title: '第一章' }])
    await expect(readChapter('project_1', 'chapter_1')).resolves.toMatchObject({ meta: { id: 'chapter_1' }, content: '' })
    await expect(saveChapter('project_1', 'chapter_1', '# 新正文')).resolves.toMatchObject({
      meta: { id: 'chapter_1' },
      content: '# 新正文'
    })
    await expect(readChapter('project_1', 'chapter_1')).resolves.toMatchObject({ content: '# 新正文' })
  })
})
