import type { CreateProjectInput, OpenProjectInput, Project, ProjectWorkspace } from '@shared/schemas/project.schema'
import { createProject as createProjectRecord, listProjects as listProjectRecords, openProject as openProjectRecord } from '../repositories/projectRepository'

export async function listProjects(): Promise<Project[]> {
  return listProjectRecords()
}

export async function createProject(input: CreateProjectInput): Promise<ProjectWorkspace> {
  const now = new Date().toISOString()
  const project: Project = {
    schemaVersion: 1,
    id: createId('project'),
    name: input.name.trim(),
    createdAt: now,
    updatedAt: now
  }

  return createProjectRecord(project)
}

export async function openProject(input: OpenProjectInput): Promise<ProjectWorkspace> {
  return openProjectRecord(input.projectId)
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
