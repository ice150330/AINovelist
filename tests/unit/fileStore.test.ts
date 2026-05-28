import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { z } from 'zod'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ensureDir, readJson, readText, writeJsonAtomic, writeTextAtomic } from '../../src/main/services/fileStore'

let root: string

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'ainovelist-filestore-'))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('fileStore', () => {
  it('writes and reads json atomically', async () => {
    const path = join(root, 'data.json')
    const schema = z.object({ name: z.string() })

    await writeJsonAtomic(path, { name: '测试' })

    await expect(readJson(path, schema)).resolves.toEqual({ name: '测试' })
  })

  it('writes and reads text atomically', async () => {
    const path = join(root, 'chapter.md')

    await writeTextAtomic(path, '# 第一章')

    await expect(readText(path)).resolves.toBe('# 第一章')
  })

  it('creates backup before overwrite', async () => {
    const path = join(root, 'chapter.md')
    const backupDir = join(root, '.backup')

    await writeTextAtomic(path, '旧内容')
    await writeTextAtomic(path, '新内容', backupDir)

    const backups = await readdir(backupDir)
    expect(backups).toHaveLength(1)
    await expect(readText(join(backupDir, backups[0]))).resolves.toBe('旧内容')
    await expect(readText(path)).resolves.toBe('新内容')
  })

  it('ensures directories recursively', async () => {
    const path = join(root, 'a', 'b')

    await ensureDir(path)
    await writeTextAtomic(join(path, 'file.txt'), 'ok')

    await expect(readText(join(path, 'file.txt'))).resolves.toBe('ok')
  })
})
