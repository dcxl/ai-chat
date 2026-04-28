export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type ModelProvider = 'qwen' | 'openai' | 'claude'

export interface ModelConfig {
  id: string
  name: string
  provider: ModelProvider
  enabled: boolean
}

export interface ChatRequest {
  prompt: string
  sessionId: string
  model: string
  knowledgeId?: string
}
