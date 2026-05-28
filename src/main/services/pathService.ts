import { resolve } from 'node:path'
import { DEFAULT_PATHS } from '@shared/constants/paths'

const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]+$/

export interface AppEnvironment {
  workspacePath: string
  knowledgeBasePath: string
  modelsPath: string
  cachePath: string
}

export function getAppEnvironment(): AppEnvironment {
  return {
    workspacePath: DEFAULT_PATHS.workspace,
    knowledgeBasePath: DEFAULT_PATHS.knowledgeBase,
    modelsPath: DEFAULT_PATHS.models,
    cachePath: DEFAULT_PATHS.cache
  }
}

export function assertSafeId(id: string): string {
  if (!SAFE_ID_PATTERN.test(id)) {
    throw new Error('ID 包含非法字符，已拒绝访问')
  }

  return id
}

export function resolveInside(root: string, ...segments: string[]): string {
  const rootPath = resolve(root)
  const targetPath = resolve(rootPath, ...segments)
  const normalizedRoot = rootPath.toLowerCase()
  const normalizedTarget = targetPath.toLowerCase()

  if (
    normalizedTarget !== normalizedRoot &&
    !normalizedTarget.startsWith(`${normalizedRoot}\\`) &&
    !normalizedTarget.startsWith(`${normalizedRoot}/`)
  ) {
    throw new Error('路径越界，已拒绝访问')
  }

  return targetPath
}

export function resolveWorkspacePath(...segments: string[]): string {
  return resolveInside(DEFAULT_PATHS.workspace, ...segments)
}

export function resolveProjectPath(projectId: string): string {
  return resolveWorkspacePath(assertSafeId(projectId))
}

export function resolveProjectBackupPath(projectId: string): string {
  return resolveInside(resolveProjectPath(projectId), '.backup')
}

export function resolveChapterMarkdownPath(projectId: string, chapterId: string): string {
  return resolveInside(resolveProjectPath(projectId), 'chapters', `${assertSafeId(chapterId)}.md`)
}

export function resolveChapterMetaPath(projectId: string, chapterId: string): string {
  return resolveInside(resolveProjectPath(projectId), 'chapters_meta', `${assertSafeId(chapterId)}.json`)
}
