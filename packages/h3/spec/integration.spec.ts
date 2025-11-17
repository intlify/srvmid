import { eventHandler, H3 } from 'h3'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { delay as sleep } from '../../shared/helper.ts'

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
  test('basic detection', async () => {
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

  test('detect with async parallel loading', async () => {
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
    const resList: { message: string }[] = await Promise.all(
      ['en', 'ja'].map(async (locale): Promise<{ message: string }> => {
        const res: Response = await app.request(`/?locale=${locale}`)
        return (await res.json()) as { message: string }
      })
    )
    expect(resList).toEqual([translated['en'], translated['ja']])
  })
})
