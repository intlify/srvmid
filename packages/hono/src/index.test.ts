import { createCoreContext } from '@intlify/core'
import { Hono } from 'hono'
import { afterEach, describe, expect, test } from 'vite-plus/test'
import { dropCoreRegistration, restoreCoreRegistration } from '../../shared/src/testing.ts'

import type { CoreContext, LocaleDetector } from '@intlify/core'
import type { Context } from 'hono'

import {
  defineIntlifyMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  getDetectorLocale,
  useTranslation
} from './index.ts'

afterEach(() => {
  restoreCoreRegistration()
})

test('detectLocaleFromAcceptLanguageHeader', () => {
  const mockContext = {
    req: {
      raw: {
        headers: {
          get: _name => (_name === 'accept-language' ? 'en-US,en;q=0.9,ja;q=0.8' : '')
        }
      }
    }
  } as Context

  expect(detectLocaleFromAcceptLanguageHeader(mockContext)).toBe('en-US')
})

test('detectLocaleFromAcceptLanguageHeader with a malformed header', () => {
  const mockContext = {
    req: {
      raw: {
        headers: {
          get: _name => (_name === 'accept-language' ? '!!!' : '')
        }
      }
    }
  } as Context

  expect(detectLocaleFromAcceptLanguageHeader(mockContext)).toBe('en-US')
})

test('translation with a malformed Accept-Language header', async () => {
  const app = new Hono()
  app.use(
    '*',
    defineIntlifyMiddleware({
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
  app.get('/', async c => {
    const t = await useTranslation(c)
    return c.text(t('hello', { name: 'hono' }))
  })

  const res = await app.request('/', { headers: { 'accept-language': '!!!' } })
  expect(res.status).toBe(200)
  expect(await res.text()).toBe('hello, hono')
})

test('defineIntlifyMiddleware', () => {
  const intlify = defineIntlifyMiddleware({
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
  expect(typeof intlify).toBe('function')
})

describe('useTranslation', () => {
  test('basic', async () => {
    /**
     * setup `defineIntlifyMiddleware` emulates
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
    const mockContext = {
      req: {
        raw: {
          headers: {
            get: _name => (_name === 'accept-language' ? 'ja;q=0.9,en;q=0.8' : '')
          }
        }
      },
      get: (key: string) => {
        if (key === 'intlify') {
          return context
        } else if (key === 'intlifyLocaleDetector') {
          const locale = context.locale as unknown
          return (locale as LocaleDetector).bind(null, mockContext)
        }
      }
    } as Context

    // test `useTranslation`
    const t = await useTranslation(mockContext)
    expect(t('hello', { name: 'hono' })).toEqual('こんにちは, hono')
  })

  test('not initialize context', async () => {
    const mockContext = {
      req: {
        raw: {
          headers: {
            get: _name => 'ja,en'
          }
        }
      },
      get: (_key: string) => {}
    } as Context

    await expect(() => useTranslation(mockContext)).rejects.toThrowError(
      'middleware not initialized'
    )
  })

  test('without the registration of @intlify/core', async () => {
    dropCoreRegistration()
    const app = new Hono()
    app.use(
      '*',
      defineIntlifyMiddleware({
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
    app.get('/', async c => {
      const t = await useTranslation(c)
      return c.text(t('hello', { name: 'hono' }))
    })

    const res = await app.request('/', { headers: { 'accept-language': 'ja' } })
    expect(await res.text()).toBe('こんにちは, hono')
  })
})

describe('requests through the middleware', () => {
  const messages = {
    en: {
      hello: 'hello, {name}'
    },
    ja: {
      hello: 'こんにちは, {name}'
    }
  }

  test('concurrent requests do not change the shared locale', async () => {
    const locale = (c: Context) => c.req.header('accept-language') ?? 'en'
    // typed as a string, but it holds the `locale` option (a function) here
    const sharedLocale = (c: Context): unknown => c.get('intlify')?.locale
    const app = new Hono()
    app.use('*', defineIntlifyMiddleware({ locale, messages }))
    const waiting = Promise.withResolvers<void>()
    const release = Promise.withResolvers<void>()
    app.get('/slow', async c => {
      const t = await useTranslation(c)
      const before = sharedLocale(c)
      waiting.resolve()
      // another request runs from start to end here
      await release.promise
      const after = sharedLocale(c)
      return c.json({
        translated: t('hello', { name: 'hono' }),
        unchanged: before === locale && after === locale
      })
    })
    app.get('/fast', async c => {
      const t = await useTranslation(c)
      return c.json({
        translated: t('hello', { name: 'hono' }),
        unchanged: sharedLocale(c) === locale
      })
    })

    const slow = app.request('/slow', { headers: { 'accept-language': 'ja' } })
    await waiting.promise
    const fast = await app.request('/fast', { headers: { 'accept-language': 'en' } })
    release.resolve()
    expect(await (await slow).json()).toEqual({ translated: 'こんにちは, hono', unchanged: true })
    expect(await fast.json()).toEqual({ translated: 'hello, hono', unchanged: true })
  })

  test('middleware registered before intlify translates after `await next()`', async () => {
    let translated = ''
    const app = new Hono()
    app.use('*', async (c, next) => {
      await next()
      const t = await useTranslation(c)
      translated = t('hello', { name: 'hono' })
    })
    app.use(
      '*',
      defineIntlifyMiddleware({ locale: detectLocaleFromAcceptLanguageHeader, messages })
    )
    app.get('/', c => c.text('ok'))

    await app.request('/', { headers: { 'accept-language': 'ja' } })
    expect(translated).toBe('こんにちは, hono')
  })
})

test('getDetectorLocale', async () => {
  /**
   * setup `defineIntlifyMiddleware` emulates
   */
  const context = createCoreContext({
    locale: detectLocaleFromAcceptLanguageHeader
  })
  const mockContext = {
    req: {
      raw: {
        headers: {
          get: _name => (_name === 'accept-language' ? 'ja;q=0.9,en;q=0.8' : '')
        }
      }
    },
    get: (key: string) => {
      if (key === 'intlify') {
        return context
      } else if (key === 'intlifyLocaleDetector') {
        const locale = context.locale as unknown
        return (locale as LocaleDetector).bind(null, mockContext)
      }
    }
  } as Context

  // test `getDetectorLocale`
  const locale = await getDetectorLocale(mockContext)
  expect(locale.language).toEqual('ja')
})

test('keeps no locale chains on the shared core context', async () => {
  let shared: CoreContext | undefined
  const app = new Hono()
  app.use(
    '*',
    defineIntlifyMiddleware({
      locale: detectLocaleFromAcceptLanguageHeader,
      messages: { en: { hello: 'hello' } }
    })
  )
  app.get('/', async c => {
    shared = c.get('intlify')
    const t = await useTranslation(c)
    return c.text(t('hello'))
  })

  const texts: string[] = []
  for (let i = 0; i < 100; i++) {
    const res = await app.request('/', { headers: { 'accept-language': `en-x-r${i}` } })
    texts.push(await res.text())
  }
  expect(texts).toEqual(Array.from({ length: 100 }, () => 'hello'))
  const cache = (shared as unknown as { __localeChainCache?: Map<string, unknown> })
    .__localeChainCache
  expect(cache?.size ?? 0).toBe(0)
})
