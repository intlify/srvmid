import { Hono } from 'hono'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { delay as sleep } from '../../shared/src/index.ts'
import {
  defineIntlifyMiddleware,
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
  app = new Hono()
  app.use('*', intlify)
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

    const intlify = defineIntlifyMiddleware({
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
    app.use('*', intlify)
    app.get('/', async c => {
      const t = await useTranslation(c)
      return c.json({ message: t('hello', { name: 'hono' }) })
    })

    const res = await app.request('/?locale=ja')
    expect(await res.json()).toEqual({ message: 'こんにちは, hono' })
  })

  const messages: Record<
    string,
    () => Promise<typeof import('./fixtures/en.json') | typeof import('./fixtures/ja.json')>
  > = {
    en: () => import('./fixtures/en.json', { with: { type: 'json' } }).then(m => m.default),
    ja: () => import('./fixtures/ja.json', { with: { type: 'json' } }).then(m => m.default)
  }

  test('detect with async loading', async () => {
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

    const intlify = defineIntlifyMiddleware({
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
    app.use('*', intlify)
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
    // async locale detector
    const localeDetector = async (c: Context, i18n: CoreContext<string, DefineLocaleMessage>) => {
      const locale = getQueryLocale(c.req.raw).toString()
      await sleep(100)
      const loader = messages[locale]
      if (loader && !i18n.messages[locale]) {
        const message = await loader()
        i18n.messages[locale] = message
      }
      return locale
    }

    const intlify = defineIntlifyMiddleware({
      locale: localeDetector,
      messages: {
        en: {
          hello: 'hello, {name}'
        }
      }
    })

    app = new Hono()
    app.use('*', intlify)
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
    const resList: { message: string }[] = await Promise.all(
      ['en', 'ja'].map(async (locale): Promise<{ message: string }> => {
        const res: Response = await app.request(`/?locale=${locale}`)
        return (await res.json()) as { message: string }
      })
    )
    expect(resList).toEqual([translated['en'], translated['ja']])
  })
})
