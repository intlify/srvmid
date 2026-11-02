import { Elysia } from 'elysia'
import { afterEach, expect, test } from 'vite-plus/test'
import { dropCoreRegistration, restoreCoreRegistration } from '../../shared/src/testing.ts'

import type { CoreContext } from '@intlify/core'
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

test('detectLocaleFromAcceptLanguageHeader with a malformed header', () => {
  const mockContext = {
    request: {
      headers: {
        get: _name => (_name === 'accept-language' ? '!!!' : '')
      }
    }
  } as ElysiaContext

  expect(detectLocaleFromAcceptLanguageHeader(mockContext)).toBe('en-US')
})

test('translation with a malformed Accept-Language header', async () => {
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
    new Request('http://localhost/', { headers: { 'accept-language': '!!!' } })
  )
  expect(res.status).toBe(200)
  expect(await res.text()).toBe('hello, elysia')
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

test('keeps no locale chains on the shared core context', async () => {
  let shared: CoreContext | undefined
  const app = new Elysia()
    .use(
      intlify({
        // the default detector, which also gets the shared core context
        locale: (ctx: ElysiaContext, context: CoreContext) => {
          shared = context
          return detectLocaleFromAcceptLanguageHeader(ctx)
        },
        messages: { en: { hello: 'hello' } }
      })
    )
    .get('/', ctx => ctx.translate('hello'))

  const texts: string[] = []
  for (let i = 0; i < 100; i++) {
    const res = await app.handle(
      new Request('http://localhost/', { headers: { 'accept-language': `en-x-r${i}` } })
    )
    texts.push(await res.text())
  }
  expect(texts).toEqual(Array.from({ length: 100 }, () => 'hello'))
  const cache = (shared as unknown as { __localeChainCache?: Map<string, unknown> })
    .__localeChainCache
  expect(cache?.size ?? 0).toBe(0)
})
