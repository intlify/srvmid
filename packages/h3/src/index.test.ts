import { createCoreContext } from '@intlify/core'
import { mockEvent } from 'h3'
import { describe, expect, test } from 'vite-plus/test'
import { SYMBOL_INTLIFY, SYMBOL_INTLIFY_LOCALE } from '../../shared/src/symbols.ts'

import {
  defineIntlifyMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  getDetectorLocale,
  useTranslation
} from './index.ts'

import type { CoreContext, LocaleDetector } from '@intlify/core'
import type { H3Event } from 'h3'

function createEventMock(acceptLanguage: string, context: Record<symbol, unknown> = {}): H3Event {
  const event = mockEvent('/', { headers: { 'accept-language': acceptLanguage } })
  Object.assign(event.context, context)
  return event
}

test('detectLocaleFromAcceptLanguageHeader', () => {
  const eventMock = createEventMock('en-US,en;q=0.9,ja;q=0.8')
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
