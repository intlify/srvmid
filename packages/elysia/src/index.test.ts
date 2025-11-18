import { expect, test } from 'vitest'

import type { Context as ElysiaContext } from 'elysia'

import { detectLocaleFromAcceptLanguageHeader } from './index.ts'

test('detectLocaleFromAcceptLanguageHeader', () => {
  const mockContext = {
    request: {
      headers: {
        get: _name => (_name === 'accept-language' ? 'en-US,en;q=0.9,ja;q=0.8' : '')
      }
    }
  } as ElysiaContext

  expect(detectLocaleFromAcceptLanguageHeader(mockContext)).toBe('en-US')
})
