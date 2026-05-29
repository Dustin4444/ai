import { bench, describe } from 'vitest'
import {
  createCallbacksTransformer,
  createEventStreamTransformer,
  trimStartOfStreamHelper
} from '../streams/ai-stream'

describe('trimStartOfStreamHelper', () => {
  bench('trim whitespace on first call', () => {
    const trim = trimStartOfStreamHelper()
    trim('   Hello')
    trim('   world')
  })

  bench('no whitespace to trim', () => {
    const trim = trimStartOfStreamHelper()
    trim('Hello')
    trim('world')
  })

  bench('multiple calls with mixed content', () => {
    const trim = trimStartOfStreamHelper()
    trim('  ')
    trim('  ')
    trim('  Hello')
    trim('world')
    trim('  end')
  })
})

describe('createCallbacksTransformer', () => {
  bench('transform with no callbacks', async () => {
    const transformer = createCallbacksTransformer(undefined)
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('Hello')
        controller.enqueue(' world')
        controller.close()
      }
    })
    const transformed = stream.pipeThrough(transformer)
    const reader = transformed.getReader()
    while (true) {
      const { done } = await reader.read()
      if (done) break
    }
  })

  bench('transform with onToken callback', async () => {
    const tokens: string[] = []
    const transformer = createCallbacksTransformer({
      onToken: token => {
        tokens.push(token)
      }
    })
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('Hello')
        controller.enqueue(', ')
        controller.enqueue('world')
        controller.enqueue('.')
        controller.close()
      }
    })
    const transformed = stream.pipeThrough(transformer)
    const reader = transformed.getReader()
    while (true) {
      const { done } = await reader.read()
      if (done) break
    }
  })

  bench('transform with all callbacks', async () => {
    let completion = ''
    const transformer = createCallbacksTransformer({
      onStart: () => {},
      onToken: () => {},
      onCompletion: c => {
        completion = c
      }
    })
    const stream = new ReadableStream({
      start(controller) {
        for (let i = 0; i < 10; i++) {
          controller.enqueue(`chunk${i}`)
        }
        controller.close()
      }
    })
    const transformed = stream.pipeThrough(transformer)
    const reader = transformed.getReader()
    while (true) {
      const { done } = await reader.read()
      if (done) break
    }
  })
})

describe('createEventStreamTransformer', () => {
  bench('parse SSE events', async () => {
    const encoder = new TextEncoder()
    const transformer = createEventStreamTransformer()
    const sseData = [
      'data: {"content":"Hello"}\n\n',
      'data: {"content":" world"}\n\n',
      'data: {"content":"."}\n\n',
      'data: [DONE]\n\n'
    ]
    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of sseData) {
          controller.enqueue(encoder.encode(chunk))
        }
        controller.close()
      }
    })
    const transformed = stream.pipeThrough(transformer)
    const reader = transformed.getReader()
    try {
      while (true) {
        const { done } = await reader.read()
        if (done) break
      }
    } catch {
      // stream terminated by [DONE]
    }
  })

  bench('parse SSE events with custom parser', async () => {
    const encoder = new TextEncoder()
    const transformer = createEventStreamTransformer(data => {
      const json = JSON.parse(data)
      return json.content
    })
    const sseData = [
      'data: {"content":"Hello"}\n\n',
      'data: {"content":" world"}\n\n',
      'data: {"content":"!"}\n\n',
      'data: [DONE]\n\n'
    ]
    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of sseData) {
          controller.enqueue(encoder.encode(chunk))
        }
        controller.close()
      }
    })
    const transformed = stream.pipeThrough(transformer)
    const reader = transformed.getReader()
    try {
      while (true) {
        const { done } = await reader.read()
        if (done) break
      }
    } catch {
      // stream terminated by [DONE]
    }
  })
})
