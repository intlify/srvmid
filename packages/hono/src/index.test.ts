import { createCoreContext } from '@intlify/core'
import { describe, expect, test } from 'vitest'

import type { LocaleDetector } from '@intlify/core'
import type { Context } from 'hono'

import {
  defineIntlifyMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  getDetectorLocale,
  useTranslation
} from './index.ts'

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

    await expect(() => useTranslation(mockContext)).rejects.toThrowError()
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
