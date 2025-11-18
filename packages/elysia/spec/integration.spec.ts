import { Elysia } from 'elysia'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { delay as sleep } from '../../shared/src/index.ts'

import { detectLocaleFromAcceptLanguageHeader, getQueryLocale, intlify } from '../src/index.ts'

import type { CoreContext } from '@intlify/core'
import type { Context as ElysiaContext } from 'elysia'
import type { DefineLocaleMessage } from '../src/index.ts'

afterEach(() => {
  vi.resetAllMocks()
})

test('plugin', async () => {
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
    .get('/', ctx => {
      return {
        locale: ctx.locale,
        message: ctx.translate('hello', { name: 'elysia' })
      }
    })

  const response = await app.fetch(
    new Request('http://localhost/', {
      headers: { 'accept-language': 'en;q=0.9,ja;q=0.8' }
    })
  )
  const body = await response.json()
  expect(body).toEqual({ message: 'hello, elysia', locale: 'en' })
})

describe('custom locale detection', () => {
  test('basic detection', async () => {
    // define custom locale detector
    const localeDetector = (ctx: ElysiaContext): string => {
      return getQueryLocale(ctx.request).toString()
    }

    const app = new Elysia()
      .use(
        intlify({
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
      )
      .get('/', ctx => {
        return { message: ctx.translate('hello', { name: 'elysia' }) }
      })

    const response = await app.fetch(new Request('http://localhost/?locale=ja'))
    const body = await response.json()
    expect(body).toEqual({ message: 'こんにちは, elysia' })
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
    const localeDetector = async (
      elysia: ElysiaContext,
      intlify: CoreContext<string, DefineLocaleMessage>
    ) => {
      const locale = getQueryLocale(elysia.request).toString()
      await sleep(100)
      const loader = messages[locale]
      if (loader && !intlify.messages[locale]) {
        const message = await loader()
        intlify.messages[locale] = message
      }
      return locale
    }

    const app = new Elysia()
      .use(
        intlify({
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
      )
      .get('/', ctx => {
        return { message: ctx.translate('hello', { name: 'elysia' }) }
      })

    const translated: Record<string, { message: string }> = {
      en: {
        message: 'hello, elysia'
      },
      ja: {
        message: 'こんにちは, elysia'
      }
    }
    for (const locale of ['en', 'ja']) {
      const response = await app.fetch(new Request(`http://localhost/?locale=${locale}`))
      const body = await response.json()
      expect(body).toEqual(translated[locale])
    }
  })

  test('detect with async parallel loading', async () => {
    // async locale detector
    const localeDetector = async (
      elysia: ElysiaContext,
      intlify: CoreContext<string, DefineLocaleMessage>
    ) => {
      const locale = getQueryLocale(elysia.request).toString()
      await sleep(100)
      const loader = messages[locale]
      if (loader && !intlify.messages[locale]) {
        const message = await loader()
        intlify.messages[locale] = message
      }
      return locale
    }

    const app = new Elysia()
      .use(
        intlify({
          locale: localeDetector,
          messages: {
            en: {
              hello: 'hello, {name}'
            }
          }
        })
      )
      .get('/', async ctx => {
        await sleep(100)
        return { message: ctx.translate('hello', { name: 'elysia' }) }
      })

    const translated: Record<string, { message: string }> = {
      en: {
        message: 'hello, elysia'
      },
      ja: {
        message: 'こんにちは, elysia'
      }
    }

    // request in parallel
    const resList: { message: string }[] = await Promise.all(
      ['en', 'ja'].map(async (locale): Promise<{ message: string }> => {
        const res: Response = await app.fetch(new Request(`http://localhost/?locale=${locale}`))
        return (await res.json()) as { message: string }
      })
    )
    expect(resList).toEqual([translated['en'], translated['ja']])
  })
})
