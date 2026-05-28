export function createSafeId(prefix: string, now = Date.now(), entropy = Math.random().toString(36)): string {
  const cleanPrefix = prefix.replace(/[^A-Za-z0-9_-]/g, '_')
  const cleanEntropy = entropy.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 10)
  return `${cleanPrefix}_${now}_${cleanEntropy || 'id'}`
}
