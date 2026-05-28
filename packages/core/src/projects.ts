import type { CreateProjectInput, Project } from '@ainovelist/schema'
import { createSafeId } from './ids'

export function createProjectEntity(input: CreateProjectInput, at = new Date()): Project {
  const now = at.toISOString()

  return {
    schemaVersion: 1,
    id: createSafeId('project'),
    name: input.name.trim(),
    createdAt: now,
    updatedAt: now
  }
}

export function touchProject(project: Project, at = new Date()): Project {
  return {
    ...project,
    updatedAt: at.toISOString()
  }
}
