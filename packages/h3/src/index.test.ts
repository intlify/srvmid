import { createCoreContext } from '@intlify/core'
import { describe, expect, test } from 'vitest'
import { SYMBOL_INTLIFY, SYMBOL_INTLIFY_LOCALE } from './symbols.ts'

import {
  defineIntlifyMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  getDetectorLocale,
  useTranslation
} from './index.ts'

import type { CoreContext, LocaleDetector } from '@intlify/core'
import type { H3Event } from 'h3'

test('detectLocaleFromAcceptLanguageHeader', () => {
  const eventMock = {
    req: {
      headers: {
        get: _name => (_name === 'accept-language' ? 'en-US,en;q=0.9,ja;q=0.8' : '')
      }
    }
  } as H3Event
  expect(detectLocaleFromAcceptLanguageHeader(eventMock)).toBe('en-US')
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
    const eventMock = {
      req: {
        headers: {
          get: _name => (_name === 'accept-language' ? 'ja;q=0.9,en;q=0.8' : '')
        }
      },
      context: {
        [SYMBOL_INTLIFY]: context as CoreContext
      }
    } as H3Event
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
    const eventMock = {
      req: {
        headers: {
          get: _name => (_name === 'accept-language' ? 'ja,en' : '')
        }
      },
      context: {}
    } as H3Event

    await expect(() => useTranslation(eventMock)).rejects.toThrowError()
  })
})

test('getDetectorLocale', async () => {
  const context = createCoreContext({
    locale: detectLocaleFromAcceptLanguageHeader
  })
  const eventMock = {
    req: {
      headers: {
        get: _name => (_name === 'accept-language' ? 'ja;q=0.9,en;q=0.8' : '')
      }
    },
    context: {
      [SYMBOL_INTLIFY]: context as CoreContext
    }
  } as H3Event
  const _locale = context.locale as unknown
  const bindLocaleDetector = (_locale as LocaleDetector).bind(null, eventMock)
  // @ts-ignore ignore type error because this is test
  context.locale = bindLocaleDetector
  eventMock.context[SYMBOL_INTLIFY_LOCALE] = bindLocaleDetector

  const locale = await getDetectorLocale(eventMock)
  expect(locale.language).toEqual('ja')
})
