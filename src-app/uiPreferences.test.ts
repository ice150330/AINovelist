import { describe, expect, it } from 'vitest'
import {
  defaultUiPreferences,
  normalizeUiPreferences,
  readUiPreferences,
  uiPreferenceStorageKey,
  writeUiPreferences,
  type UiPreferences
} from './uiPreferences'

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('uiPreferences', () => {
  it('normalizes invalid stored values back to defaults', () => {
    expect(normalizeUiPreferences({ density: 'wide' as never, scale: 'giant' as never })).toEqual(defaultUiPreferences)
  })

  it('persists and reads preferences safely', () => {
    const storage = new MemoryStorage()
    const preferences: UiPreferences = {
      density: 'compact',
      scale: 'large',
      sidebarCollapsed: true
    }

    writeUiPreferences(preferences, storage)

    expect(storage.getItem(uiPreferenceStorageKey)).toContain('compact')
    expect(readUiPreferences(storage)).toEqual(preferences)
  })
})
