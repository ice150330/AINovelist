export interface AppEnvironment {
  workspacePath: string
  knowledgeBasePath: string
  modelsPath: string
  cachePath: string
}

export interface Project {
  schemaVersion: 1
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ChapterMeta {
  schemaVersion: 1
  id: string
  title: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface ChapterDocument {
  meta: ChapterMeta
  content: string
}

export interface ProjectWorkspace {
  project: Project
  chapters: ChapterMeta[]
}

export type CharacterRole = 'protagonist' | 'supporting' | 'antagonist' | 'minor' | 'other'

export interface Character {
  schemaVersion: 1
  id: string
  name: string
  role: CharacterRole
  aliases: string[]
  tags: string[]
  appearance: string
  motivation: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface KnowledgeEntry {
  id: string
  title: string
  category?: string
  tags: string[]
  type?: string
  sourcePath?: string
  excerpt?: string
  updatedAt?: string
}

export interface HardConstraint {
  id: string
  type: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  source: 'user' | 'ai'
}

export interface WritingRequest {
  projectId?: string
  intent: 'continue' | 'rewrite' | 'expand' | 'outline_branch' | 'scene_script'
  povCharacterId?: string
  sceneType: 'dialogue' | 'action' | 'description' | 'transition' | 'monologue'
  mood: 'tense' | 'relaxed' | 'sad' | 'joyful' | 'mysterious' | 'violent'
  pacing: 'fast' | 'normal' | 'slow'
  requiredCharacterIds: string[]
  bannedCharacterIds: string[]
  targetWords: number
  userNote?: string
  knowledgeEntryIds: string[]
}

export interface GenerateTextResult {
  text: string
  provider: string
  createdAt: string
}

export interface ExportProjectResult {
  filePath: string
  format: 'markdown' | 'txt'
  chapterCount: number
  exportedAt: string
}
