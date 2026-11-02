import { createCoreContext } from '@intlify/core'
import { H3 } from 'nitro/h3'
import { afterEach, describe, expect, test } from 'vite-plus/test'
import { SYMBOL_INTLIFY, SYMBOL_INTLIFY_LOCALE } from '../../shared/src/symbols.ts'
import { dropCoreRegistration, restoreCoreRegistration } from '../../shared/src/testing.ts'

import {
  detectLocaleFromAcceptLanguageHeader,
  getDetectorLocale,
  intlify,
  useTranslation
} from './index.ts'

import type { CoreContext, LocaleDetector } from '@intlify/core'
import type { HTTPEvent } from 'nitro/h3'
import type { NitroAppPlugin } from 'nitro/types'

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

afterEach(() => {
  restoreCoreRegistration()
})

test('detectLocaleFromAcceptLanguageHeader', () => {
  const eventMock = createEventMock('en-US,en;q=0.9,ja;q=0.8')
  expect(detectLocaleFromAcceptLanguageHeader(eventMock)).toBe('en-US')
})

test('detectLocaleFromAcceptLanguageHeader with a malformed header', () => {
  const eventMock = createEventMock('!!!')
  expect(detectLocaleFromAcceptLanguageHeader(eventMock)).toBe('en-US')
})

test('translation with a malformed Accept-Language header', async () => {
  let onRequest: ((event: HTTPEvent) => unknown) | undefined
  const nitroApp = {
    hooks: {
      hook: (name: string, fn: (event: HTTPEvent) => unknown) => {
        if (name === 'request') {
          onRequest = fn
        }
      }
    }
  } as unknown as Parameters<NitroAppPlugin>[0]
  await intlify({
    locale: detectLocaleFromAcceptLanguageHeader,
    messages: {
      en: {
        hello: 'hello, {name}'
      },
      ja: {
        hello: 'こんにちは, {name}'
      }
    }
  })(nitroApp)

  const eventMock = createEventMock('!!!')
  await onRequest?.(eventMock)
  const t = await useTranslation(eventMock)
  expect(t('hello', { name: 'nitro' })).toEqual('hello, nitro')
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
      [SYMBOL_INTLIFY]: context
    })
    const locale = context.locale as unknown
    const bindLocaleDetector = (locale as LocaleDetector).bind(null, eventMock)
    // @ts-ignore ignore type error because this is test
    context.locale = bindLocaleDetector
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-member-access -- test mock
    ;(eventMock as any).context[SYMBOL_INTLIFY_LOCALE] = bindLocaleDetector

    const t = await useTranslation(eventMock)
    expect(t('hello', { name: 'nitro' })).toEqual('こんにちは, nitro')
  })

  test('not initialize context', async () => {
    const eventMock = createEventMock('ja,en')
    // set empty context for the mock
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-member-access -- test mock
    ;(eventMock as any).context = {}

    await expect(() => useTranslation(eventMock)).rejects.toThrowError(
      'plugin has not been initialized'
    )
  })

  test('without the registration of @intlify/core', async () => {
    dropCoreRegistration()
    let onRequest: ((event: HTTPEvent) => unknown) | undefined
    const nitroApp = {
      hooks: {
        hook: (name: string, fn: (event: HTTPEvent) => unknown) => {
          if (name === 'request') {
            onRequest = fn
          }
        }
      }
    } as unknown as Parameters<NitroAppPlugin>[0]
    await intlify({
      locale: detectLocaleFromAcceptLanguageHeader,
      messages: {
        en: {
          hello: 'hello, {name}'
        },
        ja: {
          hello: 'こんにちは, {name}'
        }
      }
    })(nitroApp)

    const eventMock = createEventMock('ja')
    expect(onRequest).toBeTypeOf('function')
    await onRequest?.(eventMock)
    const t = await useTranslation(eventMock)
    expect(t('hello', { name: 'nitro' })).toEqual('こんにちは, nitro')
  })
})

type NitroApp = Parameters<NitroAppPlugin>[0]
type Hook = (...args: never[]) => unknown

describe('after the handler returns', () => {
  const options = {
    locale: detectLocaleFromAcceptLanguageHeader,
    messages: {
      en: {
        hello: 'hello, {name}'
      },
      ja: {
        hello: 'こんにちは, {name}'
      }
    }
  }
  const request = () => new Request('http://localhost/', { headers: { 'accept-language': 'ja' } })

  // an H3 app that calls the Nitro hooks from its global hooks, like the Nitro runtime does
  async function createNitroLikeApp(setup?: (nitroApp: NitroApp) => void): Promise<H3> {
    const hooks: Record<string, Hook[]> = {}
    const nitroApp = {
      hooks: { hook: (name: string, fn: Hook) => void (hooks[name] ??= []).push(fn) }
    } as unknown as NitroApp
    const call = async (name: string, ...args: unknown[]) => {
      for (const fn of hooks[name] ?? []) {
        await (fn as (...a: unknown[]) => unknown)(...args)
      }
    }
    await intlify(options)(nitroApp)
    setup?.(nitroApp)
    return new H3({
      onRequest: event => call('request', event),
      onResponse: (response, event) => call('response', response, event)
    })
  }

  test('the translation function works after the response', async () => {
    let t: Awaited<ReturnType<typeof useTranslation>> | undefined
    const app = await createNitroLikeApp()
    app.get('/', async event => {
      t = await useTranslation(event)
      return 'ok'
    })

    const res = await app.fetch(request())
    await res.text()
    expect(t?.('hello', { name: 'nitro' })).toBe('こんにちは, nitro')
  })

  test('translates while streaming the response body', async () => {
    const responded = Promise.withResolvers<void>()
    const app = await createNitroLikeApp()
    app.get('/', async event => {
      const t = await useTranslation(event)
      return new ReadableStream<Uint8Array>({
        async pull(controller) {
          // translate after the response is created
          await responded.promise
          controller.enqueue(new TextEncoder().encode(t('hello', { name: 'nitro' })))
          controller.close()
        }
      })
    })

    const res = await app.fetch(request())
    responded.resolve()
    expect(await res.text()).toBe('こんにちは, nitro')
  })

  test('translates in the `response` hook of a plugin registered after intlify', async () => {
    const translated = Promise.withResolvers<string>()
    const app = await createNitroLikeApp(nitroApp => {
      nitroApp.hooks.hook('response', async (_response, event) => {
        try {
          const t = await useTranslation(event)
          translated.resolve(t('hello', { name: 'nitro' }))
        } catch (error) {
          translated.reject(error)
        }
      })
    })
    app.get('/', () => 'ok')

    await app.fetch(request())
    await expect(translated.promise).resolves.toBe('こんにちは, nitro')
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
  // oxlint-disable-next-line @typescript-eslint/no-unsafe-member-access -- test mock
  ;(eventMock as any).context[SYMBOL_INTLIFY_LOCALE] = bindLocaleDetector

  const locale = await getDetectorLocale(eventMock)
  expect(locale.language).toEqual('ja')
})

test('keeps no locale chains on the shared core context', async () => {
  let shared: CoreContext | undefined
  let onRequest: ((event: HTTPEvent) => unknown) | undefined
  const nitroApp = {
    hooks: {
      hook: (name: string, fn: (event: HTTPEvent) => unknown) => {
        if (name === 'request') {
          onRequest = fn
        }
      }
    }
  } as unknown as Parameters<NitroAppPlugin>[0]
  await intlify({
    // the default detector, which also gets the shared core context
    locale: (event: HTTPEvent, context: CoreContext) => {
      shared = context
      return detectLocaleFromAcceptLanguageHeader(event)
    },
    messages: { en: { hello: 'hello' } }
  })(nitroApp)

  const texts: string[] = []
  for (let i = 0; i < 100; i++) {
    const eventMock = createEventMock(`en-x-r${i}`)
    await onRequest?.(eventMock)
    const t = await useTranslation(eventMock)
    texts.push(t('hello'))
  }
  expect(texts).toEqual(Array.from({ length: 100 }, () => 'hello'))
  const cache = (shared as unknown as { __localeChainCache?: Map<string, unknown> })
    .__localeChainCache
  expect(cache?.size ?? 0).toBe(0)
})
