import { Elysia } from 'elysia'
import { afterEach, expect, test } from 'vite-plus/test'
import { dropCoreRegistration, restoreCoreRegistration } from '../../shared/src/testing.ts'

import type { Context as ElysiaContext } from 'elysia'

import { detectLocaleFromAcceptLanguageHeader, intlify } from './index.ts'

afterEach(() => {
  restoreCoreRegistration()
})

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

test('translation without the registration of @intlify/core', async () => {
  dropCoreRegistration()
  const app = new Elysia()
    .use(
      intlify({
        locale: detectLocaleFromAcceptLanguageHeader,
        messages: {
          en: {
            hello: 'hello, {name}'
          },
          ja: {
            hello: 'こんにちは, {name}'
          }
        }
      })
    )
    .get('/', ctx => ctx.translate('hello', { name: 'elysia' }))

  const res = await app.handle(
    new Request('http://localhost/', { headers: { 'accept-language': 'ja' } })
  )
  expect(await res.text()).toBe('こんにちは, elysia')
})
