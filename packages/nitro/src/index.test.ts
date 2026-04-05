import { createCoreContext } from '@intlify/core'
import { describe, expect, test } from 'vitest'
import { SYMBOL_INTLIFY, SYMBOL_INTLIFY_LOCALE } from '../../shared/src/symbols.ts'

import {
  detectLocaleFromAcceptLanguageHeader,
  getDetectorLocale,
  intlify,
  useTranslation
} from './index.ts'

import type { CoreContext, LocaleDetector } from '@intlify/core'
import type { HTTPEvent } from 'nitro/h3'

function createEventMock(acceptLanguage: string, context: Record<symbol, unknown> = {}) {
  return {
    req: {
      headers: {
        get: (_name: string) => (_name === 'accept-language' ? acceptLanguage : '')
      }
    },
    context
  } as unknown as HTTPEvent
}

test('detectLocaleFromAcceptLanguageHeader', () => {
  const eventMock = createEventMock('en-US,en;q=0.9,ja;q=0.8')
  expect(detectLocaleFromAcceptLanguageHeader(eventMock)).toBe('en-US')
})

test('intlify plugin', () => {
  const plugin = intlify({
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
  expect(plugin).toBeTypeOf('function')
})

describe('useTranslation', () => {
  test('basic', async () => {
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
      [SYMBOL_INTLIFY]: context as CoreContext
    })
    const locale = context.locale as unknown
    const bindLocaleDetector = (locale as LocaleDetector).bind(null, eventMock)
    // @ts-ignore ignore type error because this is test
    context.locale = bindLocaleDetector
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- test mock
    ;(eventMock as any).context[SYMBOL_INTLIFY_LOCALE] = bindLocaleDetector

    const t = await useTranslation(eventMock)
    expect(t('hello', { name: 'nitro' })).toEqual('こんにちは, nitro')
  })

  test('not initialize context', async () => {
    const eventMock = createEventMock('ja,en')
    // set empty context for the mock
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- test mock
    ;(eventMock as any).context = {}

    await expect(() => useTranslation(eventMock)).rejects.toThrowError()
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- test mock
  ;(eventMock as any).context[SYMBOL_INTLIFY_LOCALE] = bindLocaleDetector

  const locale = await getDetectorLocale(eventMock)
  expect(locale.language).toEqual('ja')
})
