import { copyFile, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, join, basename } from 'node:path'
import type { z } from 'zod'

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true })
}

export async function readJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const content = await readFile(path, 'utf8')
  return schema.parse(JSON.parse(content))
}

export async function writeJsonAtomic(path: string, data: unknown, backupDir?: string): Promise<void> {
  await writeTextAtomic(path, `${JSON.stringify(data, null, 2)}\n`, backupDir)
}

export async function readText(path: string): Promise<string> {
  return readFile(path, 'utf8')
}

export async function writeTextAtomic(path: string, content: string, backupDir?: string): Promise<void> {
  await ensureDir(dirname(path))

  if (backupDir) {
    await backupFileBeforeWrite(path, backupDir)
  }

  const tmpPath = `${path}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tmpPath, content, 'utf8')
  await rename(tmpPath, path)
}

export async function backupFileBeforeWrite(path: string, backupDir: string): Promise<string | null> {
  if (!(await fileExists(path))) {
    return null
  }

  await ensureDir(backupDir)
  const extension = extname(path)
  const name = basename(path, extension)
  const backupPath = join(backupDir, `${name}.${new Date().toISOString().replace(/[:.]/g, '-')}${extension}`)
  await copyFile(path, backupPath)
  return backupPath
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const result = await stat(path)
    return result.isFile()
  } catch {
    return false
  }
}
