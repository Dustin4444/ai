import { bench, describe } from 'vitest'
import {
  experimental_buildStarChatBetaPrompt,
  experimental_buildOpenAssistantPrompt,
  experimental_buildLlama2Prompt
} from '../prompts/huggingface'

const shortConversation = [
  { content: 'You are a helpful assistant.', role: 'system' as const },
  { content: 'Hello!', role: 'user' as const },
  { content: 'Hi! How can I help you?', role: 'assistant' as const },
  { content: 'What is the weather like?', role: 'user' as const }
]

const longConversation = Array.from({ length: 50 }, (_, i) => ({
  content: `This is message number ${i} with some content to make it realistic.`,
  role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant'
}))

describe('experimental_buildStarChatBetaPrompt', () => {
  bench('short conversation', () => {
    experimental_buildStarChatBetaPrompt(shortConversation)
  })

  bench('long conversation (50 messages)', () => {
    experimental_buildStarChatBetaPrompt(longConversation)
  })
})

describe('experimental_buildOpenAssistantPrompt', () => {
  const oaConversation = shortConversation.filter(m => m.role !== 'system')

  bench('short conversation', () => {
    experimental_buildOpenAssistantPrompt(oaConversation)
  })

  bench('long conversation (50 messages)', () => {
    experimental_buildOpenAssistantPrompt(longConversation)
  })
})

describe('experimental_buildLlama2Prompt', () => {
  bench('short conversation', () => {
    experimental_buildLlama2Prompt(shortConversation)
  })

  bench('long conversation (50 messages)', () => {
    experimental_buildLlama2Prompt([
      {
        content: 'You are a helpful assistant.',
        role: 'system' as const
      },
      ...longConversation
    ])
  })
})
