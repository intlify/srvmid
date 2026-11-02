import {
  compile,
  fallbackWithLocaleChain,
  fallbackWithSimple,
  registerLocaleFallbacker,
  registerMessageResolver,
  resolveValue,
  resolveWithKeyValue,
  translate
} from '@intlify/core'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { createIntlifyCoreContext, createLocaleChainFallbacker } from './core.ts'
import { dropCoreRegistration, restoreCoreRegistration } from './testing.ts'

import type { CoreContext, FallbackLocale, Locale, LocaleFallbacker } from '@intlify/core'

const messages = {
  en: { hello: 'hello, {name}', nav: { home: 'Home' } },
  ja: { hello: 'こんにちは, {name}' }
}

// the chain that `fallbackWithLocaleChain` of `@intlify/core` returns, without its cache
const chainOf = (fallback: FallbackLocale, start: Locale): Locale[] =>
  fallbackWithLocaleChain({} as CoreContext, fallback, start)

// the number of locales in the cache of `fallbackWithLocaleChain` on the context
const cachedLocales = (context: CoreContext): number =>
  (context as unknown as { __localeChainCache?: Map<Locale, Locale[]> }).__localeChainCache?.size ??
  0

afterEach(() => {
  restoreCoreRegistration()
  vi.restoreAllMocks()
})

describe('createIntlifyCoreContext', () => {
  test('with the registration of @intlify/core', () => {
    const warn = vi.spyOn(console, 'warn')
    const context = createIntlifyCoreContext({
      locale: 'ja',
      fallbackLocale: 'en',
      messages
    }) as CoreContext
    expect(translate(context, 'hello', { name: 'srvmid' })).toBe('こんにちは, srvmid')
    expect(translate(context, 'nav.home')).toBe('Home')
    expect(warn.mock.calls.flat().join('\n')).not.toContain('Custom Message Compiler')
    // `fallbackWithLocaleChain`, which `@intlify/core` registers, is replaced with the one with a limited cache
    expect(context.localeFallbacker).not.toBe(fallbackWithLocaleChain)
    expect(context.localeFallbacker(context, 'en', 'ja-JP')).toEqual(chainOf('en', 'ja-JP'))
    expect(cachedLocales(context)).toBe(0)
  })

  test('without the registration of @intlify/core', () => {
    dropCoreRegistration()
    const warn = vi.spyOn(console, 'warn')
    const context = createIntlifyCoreContext({
      locale: 'ja-JP',
      fallbackLocale: 'en',
      messages
    }) as CoreContext
    expect(context.messageCompiler).toBe(compile)
    expect(context.messageResolver).toBe(resolveValue)
    expect(context.localeFallbacker).not.toBe(fallbackWithSimple)
    expect(context.localeFallbacker(context, 'en', 'ja-JP')).toEqual(chainOf('en', 'ja-JP'))
    // placeholders need the compiler, nested keys need the resolver, and `ja-JP` -> `ja` needs the locale chain of the fallbacker
    expect(translate(context, 'hello', { name: 'srvmid' })).toBe('こんにちは, srvmid')
    expect(translate(context, 'nav.home')).toBe('Home')
    expect(warn.mock.calls.flat().join('\n')).not.toContain('Custom Message Compiler')
    expect(cachedLocales(context)).toBe(0)
  })

  test('keeps what users register', () => {
    const resolver = vi.fn<typeof resolveValue>(resolveValue)
    registerMessageResolver(resolver)
    const context = createIntlifyCoreContext({ locale: 'en', messages }) as CoreContext
    expect(context.messageResolver).toBe(resolver)
  })

  test('keeps a locale fallbacker that users register', () => {
    const fallbacker: LocaleFallbacker = (ctx, fallback, start) =>
      fallbackWithSimple(ctx, fallback, start)
    registerLocaleFallbacker(fallbacker)
    const context = createIntlifyCoreContext({ locale: 'en', messages }) as CoreContext
    expect(context.localeFallbacker).toBe(fallbacker)
  })

  test('uses the options first', () => {
    dropCoreRegistration()
    const resolver = vi.fn<typeof resolveValue>(resolveValue)
    const context = createIntlifyCoreContext({
      locale: 'en',
      messages,
      messageResolver: resolver
    }) as CoreContext
    expect(context.messageResolver).toBe(resolver)
    expect(context.messageCompiler).toBe(compile)
    expect(context.localeFallbacker(context, 'en', 'ja-JP')).toEqual(chainOf('en', 'ja-JP'))
  })

  test('keeps the built-in ones passed as options', () => {
    dropCoreRegistration()
    const context = createIntlifyCoreContext({
      locale: 'en',
      messages,
      messageResolver: resolveWithKeyValue,
      localeFallbacker: fallbackWithSimple
    }) as CoreContext
    expect(context.messageResolver).toBe(resolveWithKeyValue)
    expect(context.localeFallbacker).toBe(fallbackWithSimple)
    expect(context.messageCompiler).toBe(compile)
  })
})

describe('createLocaleChainFallbacker', () => {
  const context = {} as CoreContext

  test('returns the same chains as fallbackWithLocaleChain', () => {
    // one fallbacker for all the cases, so the chains must follow the change of the fallback locales
    const fallbacker: LocaleFallbacker = createLocaleChainFallbacker()
    const cases: [FallbackLocale, Locale][] = [
      ['en', 'ja-JP'],
      [['fr', 'en'], 'de-CH'],
      [{ 'de-CH': ['fr'], default: ['en'] }, 'de-CH'],
      ['en', 'zh-Hant-TW']
    ]
    for (const [fallback, start] of cases) {
      expect(fallbacker(context, fallback, start)).toEqual(chainOf(fallback, start))
    }
  })

  test('keeps the chains of a limited number of locales', () => {
    const fallbacker = createLocaleChainFallbacker(2)
    const ja = fallbacker(context, 'en', 'ja-JP')
    const fr = fallbacker(context, 'en', 'fr-FR')
    // kept, and now used most recently
    expect(fallbacker(context, 'en', 'ja-JP')).toBe(ja)
    // drops fr-FR, the one used least recently
    fallbacker(context, 'en', 'de-DE')
    expect(fallbacker(context, 'en', 'ja-JP')).toBe(ja)
    const frAgain = fallbacker(context, 'en', 'fr-FR')
    expect(frAgain).not.toBe(fr)
    expect(frAgain).toEqual(['fr-FR', 'fr', 'en'])
  })

  test('keeps the chains of 1,000 locales by default', () => {
    // 999 more locales: the first one is still kept
    const kept = createLocaleChainFallbacker()
    const first = kept(context, 'en', 'en-x-r0')
    for (let i = 1; i < 1000; i++) {
      kept(context, 'en', `en-x-r${i}`)
    }
    expect(kept(context, 'en', 'en-x-r0')).toBe(first)

    // 1,000 more locales: the first one is dropped
    const dropped = createLocaleChainFallbacker()
    const second = dropped(context, 'en', 'en-x-r0')
    for (let i = 1; i <= 1000; i++) {
      dropped(context, 'en', `en-x-r${i}`)
    }
    expect(dropped(context, 'en', 'en-x-r0')).not.toBe(second)
  })

  test('keeps no chain when the size is 0', () => {
    const fallbacker = createLocaleChainFallbacker(0)
    const ja = fallbacker(context, 'en', 'ja-JP')
    expect(ja).toEqual(['ja-JP', 'ja', 'en'])
    expect(fallbacker(context, 'en', 'ja-JP')).not.toBe(ja)
  })

  test('keeps nothing on the context', () => {
    const target = {} as CoreContext
    createLocaleChainFallbacker()(target, 'en', 'ja-JP')
    expect(target).toEqual({})
  })
})
