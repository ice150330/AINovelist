import type { GenerateTextResult, WritingRequest } from '@shared/schemas/ai.schema'

export async function generateWithMockProvider(request: WritingRequest): Promise<GenerateTextResult> {
  return {
    provider: 'mock',
    createdAt: new Date().toISOString(),
    text: [
      `【模拟生成｜${request.intent}】`,
      `场景类型：${request.sceneType}，情绪：${request.mood}，节奏：${request.pacing}。`,
      request.userNote ? `用户补充：${request.userNote}` : '用户补充：无。',
      `目标字数：${request.targetWords}。`,
      '这里是 Mock Provider 生成的正文占位，用于先打通结构化请求、Prompt 组装和插入章节流程。'
    ].join('\n')
  }
}
