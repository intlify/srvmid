import { createCoreContext } from '@intlify/core'
import { H3, mockEvent, onResponse } from 'h3'
import { afterEach, describe, expect, test } from 'vite-plus/test'
import { SYMBOL_INTLIFY, SYMBOL_INTLIFY_LOCALE } from '../../shared/src/symbols.ts'
import { dropCoreRegistration, restoreCoreRegistration } from '../../shared/src/testing.ts'

import {
  defineIntlifyMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  getDetectorLocale,
  intlify,
  useTranslation
} from './index.ts'

import type { CoreContext, LocaleDetector } from '@intlify/core'
import type { H3Event } from 'h3'

function createEventMock(acceptLanguage: string, context: Record<symbol, unknown> = {}): H3Event {
  const event = mockEvent('/', { headers: { 'accept-language': acceptLanguage } })
  Object.assign(event.context, context)
  return event
}

afterEach(() => {
  restoreCoreRegistration()
})

test('detectLocaleFromAcceptLanguageHeader', () => {
  const eventMock = createEventMock('en-US,en;q=0.9,ja;q=0.8')
  expect(detectLocaleFromAcceptLanguageHeader(eventMock)).toBe('en-US')
})

test('detectLocaleFromAcceptLanguageHeader with a malformed header', () => {
  const eventMock = createEventMock('!!!')
  expect(detectLocaleFromAcceptLanguageHeader(eventMock)).toBe('en-US')
})

test('translation with a malformed Accept-Language header', async () => {
  const app = new H3({
    plugins: [
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
    ]
  })
  app.get('/', async event => {
    const t = await useTranslation(event)
    return t('hello', { name: 'h3' })
  })

  const res = await app.fetch(
    new Request('http://localhost/', { headers: { 'accept-language': '!!!' } })
  )
  expect(res.status).toBe(200)
  expect(await res.text()).toBe('hello, h3')
})

test('defineIntlifyMiddleware', () => {
  const middleware = defineIntlifyMiddleware({
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
  expect(middleware.onRequest).toBeDefined()
  expect(middleware.onResponse).toBeDefined()
})

describe('useTranslation', () => {
  test('basic', async () => {
    /**
     * setup `defineI18nMiddleware` emulates
     */
    const context = createCoreContext({
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
    const eventMock = createEventMock('ja;q=0.9,en;q=0.8', {
      [SYMBOL_INTLIFY]: context
    })
    const locale = context.locale as unknown
    const bindLocaleDetector = (locale as LocaleDetector).bind(null, eventMock)
    // @ts-ignore ignore type error because this is test
    context.locale = bindLocaleDetector
    eventMock.context[SYMBOL_INTLIFY_LOCALE] = bindLocaleDetector

    // test `useTranslation`
    const t = await useTranslation(eventMock)
    expect(t('hello', { name: 'h3' })).toEqual('こんにちは, h3')
  })

  test('not initialize context', async () => {
    const eventMock = createEventMock('ja,en')

    await expect(() => useTranslation(eventMock)).rejects.toThrowError(
      'plugin has not been initialized'
    )
  })

  test('without the registration of @intlify/core', async () => {
    dropCoreRegistration()
    const app = new H3({
      plugins: [
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
      ]
    })
    app.get('/', async event => {
      const t = await useTranslation(event)
      return t('hello', { name: 'h3' })
    })

    const res = await app.fetch(
      new Request('http://localhost/', { headers: { 'accept-language': 'ja' } })
    )
    expect(await res.text()).toBe('こんにちは, h3')
  })
})

describe('after the handler returns', () => {
  const options = {
    locale: detectLocaleFromAcceptLanguageHeader,
    messages: {
      en: {
        hello: 'hello, {name}'
      },
      ja: {
        hello: 'こんにちは, {name}'
      }
    }
  }
  const request = () => new Request('http://localhost/', { headers: { 'accept-language': 'ja' } })

  test('middleware registered before the plugin translates after `await next()`', async () => {
    let translated = ''
    const app = new H3()
    app.use(async (event, next) => {
      const res = await next()
      const t = await useTranslation(event)
      translated = t('hello', { name: 'h3' })
      return res
    })
    app.register(intlify(options))
    app.get('/', () => 'ok')

    await app.fetch(request())
    expect(translated).toBe('こんにちは, h3')
  })

  test('the translation function works after the response', async () => {
    let t: Awaited<ReturnType<typeof useTranslation>> | undefined
    const app = new H3({ plugins: [intlify(options)] })
    app.get('/', async event => {
      t = await useTranslation(event)
      return 'ok'
    })

    const res = await app.fetch(request())
    await res.text()
    expect(t?.('hello', { name: 'h3' })).toBe('こんにちは, h3')
  })

  test('translates while streaming the response body', async () => {
    const responded = Promise.withResolvers<void>()
    const app = new H3({ plugins: [intlify(options)] })
    app.get('/', async event => {
      const t = await useTranslation(event)
      return new ReadableStream<Uint8Array>({
        async pull(controller) {
          // translate after the response is created
          await responded.promise
          controller.enqueue(new TextEncoder().encode(t('hello', { name: 'h3' })))
          controller.close()
        }
      })
    })

    const res = await app.fetch(request())
    responded.resolve()
    expect(await res.text()).toBe('こんにちは, h3')
  })

  test('translates in the global `onResponse` hook', async () => {
    const translated = Promise.withResolvers<string>()
    const app = new H3({
      plugins: [intlify(options)],
      onResponse: async (_response, event) => {
        try {
          const t = await useTranslation(event)
          translated.resolve(t('hello', { name: 'h3' }))
        } catch (error) {
          translated.reject(error)
        }
      }
    })
    app.get('/', () => 'ok')

    await app.fetch(request())
    await expect(translated.promise).resolves.toBe('こんにちは, h3')
  })

  test('translates in `onResponse()` middleware registered after the plugin', async () => {
    let translated = ''
    const app = new H3({ plugins: [intlify(options)] })
    app.use(
      onResponse(async (_response, event) => {
        const t = await useTranslation(event)
        translated = t('hello', { name: 'h3' })
      })
    )
    app.get('/', () => 'ok')

    await app.fetch(request())
    expect(translated).toBe('こんにちは, h3')
  })

  test('the deprecated `onResponse` middleware does nothing when it is registered', async () => {
    const intlifyMiddleware = defineIntlifyMiddleware(options)
    let translated = ''
    const app = new H3()
    app.use(async (event, next) => {
      const res = await next()
      const t = await useTranslation(event)
      translated = t('hello', { name: 'h3' })
      return res
    })
    app.use(intlifyMiddleware.onRequest)
    app.use(intlifyMiddleware.onResponse)
    app.get('/', async event => {
      const t = await useTranslation(event)
      return t('hello', { name: 'h3' })
    })

    const res = await app.fetch(request())
    expect(await res.text()).toBe('こんにちは, h3')
    expect(translated).toBe('こんにちは, h3')
  })
})

test('getDetectorLocale', async () => {
  const context = createCoreContext({
    locale: detectLocaleFromAcceptLanguageHeader
  })
  const eventMock = createEventMock('ja;q=0.9,en;q=0.8', {
    [SYMBOL_INTLIFY]: context as CoreContext
  })
  const _locale = context.locale as unknown
  const bindLocaleDetector = (_locale as LocaleDetector).bind(null, eventMock)
  // @ts-ignore ignore type error because this is test
  context.locale = bindLocaleDetector
  eventMock.context[SYMBOL_INTLIFY_LOCALE] = bindLocaleDetector

  const locale = await getDetectorLocale(eventMock)
  expect(locale.language).toEqual('ja')
})

test('keeps no locale chains on the shared core context', async () => {
  let shared: CoreContext | undefined
  const app = new H3({
    plugins: [
      intlify({
        // the default detector, which also gets the shared core context
        locale: (event: H3Event, context: CoreContext) => {
          shared = context
          return detectLocaleFromAcceptLanguageHeader(event)
        },
        messages: { en: { hello: 'hello' } }
      })
    ]
  })
  app.get('/', async event => {
    const t = await useTranslation(event)
    return t('hello')
  })

  const texts: string[] = []
  for (let i = 0; i < 100; i++) {
    const res = await app.fetch(
      new Request('http://localhost/', { headers: { 'accept-language': `en-x-r${i}` } })
    )
    texts.push(await res.text())
  }
  expect(texts).toEqual(Array.from({ length: 100 }, () => 'hello'))
  const cache = (shared as unknown as { __localeChainCache?: Map<string, unknown> })
    .__localeChainCache
  expect(cache?.size ?? 0).toBe(0)
})
