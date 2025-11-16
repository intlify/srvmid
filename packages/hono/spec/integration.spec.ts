import { Hono } from 'hono'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  defineI18nMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  getQueryLocale,
  useTranslation
} from '../src/index.ts'

import type { CoreContext } from '@intlify/core'
import type { Context } from 'hono'
import type { DefineLocaleMessage } from '../src/index.ts'

let app: Hono

afterEach(() => {
  vi.resetAllMocks()
})

test('translation', async () => {
  const i18nMiddleware = defineI18nMiddleware({
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
  app = new Hono()
  app.use('*', i18nMiddleware)
  app.get('/', async c => {
    const t = await useTranslation(c)
    return c.json({ message: t('hello', { name: 'hono' }) })
  })

  const res = await app.request('http://localhost', {
    headers: {
      'accept-language': 'en;q=0.9,ja;q=0.8'
    }
  })
  expect(await res.json()).toEqual({ message: 'hello, hono' })
})

describe('custom locale detection', () => {
  test('basic detection', async () => {
    const defaultLocale = 'en'

    // define custom locale detector
    const localeDetector = (ctx: Context): string => {
      try {
        return getQueryLocale(ctx.req.raw).toString()
      } catch {
        return defaultLocale
      }
    }

    const i18nMiddleware = defineI18nMiddleware({
      locale: localeDetector,
      messages: {
        en: {
          hello: 'hello, {name}'
        },
        ja: {
          hello: 'こんにちは, {name}'
        }
      }
    })
    app = new Hono()
    app.use('*', i18nMiddleware)
    app.get('/', async c => {
      const t = await useTranslation(c)
      return c.json({ message: t('hello', { name: 'hono' }) })
    })

    const res = await app.request('/?locale=ja')
    expect(await res.json()).toEqual({ message: 'こんにちは, hono' })
  })

  test('detect with async loading', async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const loader = (path: string) => import(path).then(m => m.default || m)
    const messages: Record<string, () => ReturnType<typeof loader>> = {
      en: () => loader('./fixtures/en.json'),
      ja: () => loader('./fixtures/ja.json')
    }

    // async locale detector
    const localeDetector = async (ctx: Context, i18n: CoreContext<string, DefineLocaleMessage>) => {
      const locale = getQueryLocale(ctx.req.raw).toString()
      await sleep(100)
      const loader = messages[locale]
      if (loader && !i18n.messages[locale]) {
        const message = await loader()
        i18n.messages[locale] = message
      }
      return locale
    }

    const i18nMiddleware = defineI18nMiddleware({
      locale: localeDetector,
      messages: {
        en: {
          hello: 'hello, {name}'
        },
        ja: {
          hello: 'こんにちは, {name}'
        }
      }
    })

    app = new Hono()
    app.use('*', i18nMiddleware)
    app.get('/', async c => {
      const t = await useTranslation(c)
      return c.json({ message: t('hello', { name: 'hono' }) })
    })

    const translated: Record<string, { message: string }> = {
      en: {
        message: 'hello, hono'
      },
      ja: {
        message: 'こんにちは, hono'
      }
    }

    for (const locale of ['en', 'ja']) {
      const res = await app.request(`/?locale=${locale}`)
      expect(await res.json()).toEqual(translated[locale])
    }
  })

  test('detect with async parallel loading', async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const loader = (path: string) => import(path).then(m => m.default || m)
    const messages: Record<string, () => ReturnType<typeof loader>> = {
      en: () => loader('./fixtures/en.json'),
      ja: () => loader('./fixtures/ja.json')
    }

    // async locale detector
    const localeDetector = async (ctx: Context, i18n: CoreContext<string, DefineLocaleMessage>) => {
      const locale = getQueryLocale(ctx.req.raw).toString()
      await sleep(100)
      const loader = messages[locale]
      if (loader && !i18n.messages[locale]) {
        const message = await loader()
        i18n.messages[locale] = message
      }
      return locale
    }

    const i18nMiddleware = defineI18nMiddleware({
      locale: localeDetector,
      messages: {
        en: {
          hello: 'hello, {name}'
        }
      }
    })

    app = new Hono()
    app.use('*', i18nMiddleware)
    app.use('/', async c => {
      await sleep(100)
      const t = await useTranslation(c)
      await sleep(100)
      return c.json({ message: t('hello', { name: 'hono' }) })
    })

    const translated: Record<string, { message: string }> = {
      en: {
        message: 'hello, hono'
      },
      ja: {
        message: 'こんにちは, hono'
      }
    }
    // request in parallel
    const resList = await Promise.all(
      ['en', 'ja'].map(locale =>
        app
          .request(`/?locale=${locale}`)
          // @ts-ignore
          .then(res => res.json())
      )
    )
    expect(resList).toEqual([translated['en'], translated['ja']])
  })
})
