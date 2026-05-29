import { bench, describe } from 'vitest'
import { nanoid, createChunkDecoder } from '../shared/utils'

describe('nanoid', () => {
  bench('generate single id', () => {
    nanoid()
  })

  bench('generate 100 ids', () => {
    for (let i = 0; i < 100; i++) {
      nanoid()
    }
  })
})

describe('createChunkDecoder', () => {
  const encoder = new TextEncoder()
  const shortChunk = encoder.encode('Hello')
  const longChunk = encoder.encode(
    'This is a longer chunk of text that simulates a more realistic streaming response from an AI model.'
  )

  bench('decode short chunk', () => {
    const decode = createChunkDecoder()
    decode(shortChunk)
  })

  bench('decode long chunk', () => {
    const decode = createChunkDecoder()
    decode(longChunk)
  })

  bench('decode multiple chunks sequentially', () => {
    const decode = createChunkDecoder()
    for (let i = 0; i < 20; i++) {
      decode(shortChunk)
    }
  })

  bench('decode undefined chunk', () => {
    const decode = createChunkDecoder()
    decode(undefined)
  })
})
