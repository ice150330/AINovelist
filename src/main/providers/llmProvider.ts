import type { GenerateTextResult, WritingRequest } from '@shared/schemas/ai.schema'

export interface LlmProvider {
  readonly name: string
  generateText(request: WritingRequest): Promise<GenerateTextResult>
  streamText?(request: WritingRequest): AsyncIterable<string>
  countTokens?(text: string): Promise<number>
}
