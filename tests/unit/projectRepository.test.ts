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
  root = await mkdtemp(join(tmpdir(), 'ainovelist-project-'))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('projectRepository', () => {
  it('creates, lists and opens projects', async () => {
    const { createProject, listProjects, openProject } = await import('../../src/main/repositories/projectRepository')
    const now = new Date().toISOString()

    await createProject({
      schemaVersion: 1,
      id: 'project_1',
      name: '测试作品',
      createdAt: now,
      updatedAt: now
    })

    await expect(listProjects()).resolves.toMatchObject([{ id: 'project_1', name: '测试作品' }])
    await expect(openProject('project_1')).resolves.toMatchObject({
      project: { id: 'project_1' },
      chapters: []
    })
  })
})
