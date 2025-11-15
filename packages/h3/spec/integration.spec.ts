import { eventHandler, H3 } from 'h3'
import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  detectLocaleFromAcceptLanguageHeader,
  getQueryLocale,
  plugin as i18n,
  useTranslation
} from '../src/index.ts'

import type { CoreContext } from '@intlify/core'
import type { H3Event } from 'h3'
import type { DefineLocaleMessage } from '../src/index.ts'

let app: H3

afterEach(() => {
  vi.resetAllMocks()
})

test('translation', async () => {
  app = new H3({
    plugins: [
      i18n({
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

  app.get(
    '/',
    eventHandler(async event => {
      const t = await useTranslation(event)
      return { message: t('hello', { name: 'h3' }) }
    })
  )

  const response = await app.fetch(
    new Request('http://localhost/', {
      headers: { 'accept-language': 'en;q=0.9,ja;q=0.8' }
    })
  )
  const body = await response.json()
  expect(body).toEqual({ message: 'hello, h3' })
})

describe('custom locale detection', () => {
  test('basic', async () => {
    // define custom locale detector
    const localeDetector = (event: H3Event): string => {
      return getQueryLocale(event.req).toString()
    }

    app = new H3({
      plugins: [
        i18n({
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
      ]
    })

    app.get(
      '/',
      eventHandler(async event => {
        const t = await useTranslation(event)
        return { message: t('hello', { name: 'h3' }) }
      })
    )

    const response = await app.fetch(new Request('http://localhost/?locale=ja'))
    const body = await response.json()
    expect(body).toEqual({ message: 'こんにちは, h3' })
  })

  test('async', async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const loader = (path: string) => import(path).then(m => m.default || m)
    const messages: Record<string, () => ReturnType<typeof loader>> = {
      en: () => loader('./fixtures/en.json'),
      ja: () => loader('./fixtures/ja.json')
    }

    // async locale detector
    const localeDetector = async (
      event: H3Event,
      i18n: CoreContext<string, DefineLocaleMessage>
    ) => {
      const locale = getQueryLocale(event.req).toString()
      await sleep(100)
      const loader = messages[locale]
      if (loader && !i18n.messages[locale]) {
        const message = await loader()
        i18n.messages[locale] = message
      }
      return locale
    }

    app = new H3({
      plugins: [
        i18n({
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
      ]
    })

    app.get(
      '/',
      eventHandler(async event => {
        const t = await useTranslation(event)
        return { message: t('hello', { name: 'h3' }) }
      })
    )

    const translated: Record<string, { message: string }> = {
      en: {
        message: 'hello, h3'
      },
      ja: {
        message: 'こんにちは, h3'
      }
    }
    for (const locale of ['en', 'ja']) {
      const response = await app.fetch(new Request(`http://localhost/?locale=${locale}`))
      const body = await response.json()
      expect(body).toEqual(translated[locale])
    }
  })
  test('async parallel', async () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const loader = (path: string) => import(path).then(m => m.default || m)
    const messages: Record<string, () => ReturnType<typeof loader>> = {
      en: () => loader('./fixtures/en.json'),
      ja: () => loader('./fixtures/ja.json')
    }

    // async locale detector
    const localeDetector = async (
      event: H3Event,
      i18n: CoreContext<string, DefineLocaleMessage>
    ) => {
      const locale = getQueryLocale(event.req).toString()
      await sleep(100)
      const loader = messages[locale]
      if (loader && !i18n.messages[locale]) {
        const message = await loader()
        i18n.messages[locale] = message
      }
      return locale
    }

    app = new H3({
      plugins: [
        i18n({
          locale: localeDetector,
          messages: {
            en: {
              hello: 'hello, {name}'
            }
          }
        })
      ]
    })

    app.use(
      '/',
      eventHandler(async event => {
        await sleep(100)
        const t = await useTranslation(event)
        await sleep(100)
        return { message: t('hello', { name: 'h3' }) }
      })
    )

    const translated: Record<string, { message: string }> = {
      en: {
        message: 'hello, h3'
      },
      ja: {
        message: 'こんにちは, h3'
      }
    }
    // request in parallel
    const resList = await Promise.all(
      ['en', 'ja'].map(locale =>
        app
          .fetch(new Request(`http://localhost/?locale=${locale}`))
          // @ts-ignore
          .then(res => res.json())
      )
    )
    expect(resList).toEqual([translated['en'], translated['ja']])
  })
})
