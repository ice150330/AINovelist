import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'
import { projectSchema, type Project, type ProjectWorkspace } from '@shared/schemas/project.schema'
import { listChapters } from './chapterRepository'
import { ensureDir, readJson, writeJsonAtomic } from '../services/fileStore'
import { resolveInside, resolveProjectBackupPath, resolveProjectPath, resolveWorkspacePath } from '../services/pathService'

const emptyObjectSchema = z.record(z.string(), z.unknown())

export async function listProjects(): Promise<Project[]> {
  const workspacePath = resolveWorkspacePath()
  await ensureDir(workspacePath)
  const entries = await readdir(workspacePath, { withFileTypes: true })
  const projects: Project[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    try {
      projects.push(await readJson(join(workspacePath, entry.name, 'novel.json'), projectSchema))
    } catch {
      continue
    }
  }

  return projects.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function createProject(project: Project): Promise<ProjectWorkspace> {
  const projectPath = resolveProjectPath(project.id)
  const backupDir = resolveProjectBackupPath(project.id)

  await ensureProjectStructure(projectPath)
  await writeJsonAtomic(resolveInside(projectPath, 'novel.json'), project, backupDir)
  await writeJsonAtomic(resolveInside(projectPath, 'characters.json'), [], backupDir)
  await writeJsonAtomic(resolveInside(projectPath, 'relations.json'), [], backupDir)
  await writeJsonAtomic(resolveInside(projectPath, 'timeline.json'), [], backupDir)
  await writeJsonAtomic(resolveInside(projectPath, 'plots.json'), [], backupDir)
  await writeJsonAtomic(resolveInside(projectPath, 'config.json'), emptyObjectSchema.parse({}), backupDir)

  return { project, chapters: [] }
}

export async function openProject(projectId: string): Promise<ProjectWorkspace> {
  const projectPath = resolveProjectPath(projectId)
  const project = await readJson(resolveInside(projectPath, 'novel.json'), projectSchema)
  const chapters = await listChapters(project.id)

  return { project, chapters }
}

export async function updateProject(project: Project): Promise<void> {
  await writeJsonAtomic(resolveInside(resolveProjectPath(project.id), 'novel.json'), project, resolveProjectBackupPath(project.id))
}

async function ensureProjectStructure(projectPath: string): Promise<void> {
  await ensureDir(projectPath)
  await ensureDir(resolveInside(projectPath, 'chapters'))
  await ensureDir(resolveInside(projectPath, 'chapters_meta'))
  await ensureDir(resolveInside(projectPath, 'memory'))
  await ensureDir(resolveInside(projectPath, '.backup'))
}
