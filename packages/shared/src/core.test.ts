import {
  compile,
  fallbackWithLocaleChain,
  fallbackWithSimple,
  registerMessageResolver,
  resolveValue,
  resolveWithKeyValue,
  translate
} from '@intlify/core'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { createIntlifyCoreContext } from './core.ts'
import { dropCoreRegistration, restoreCoreRegistration } from './testing.ts'

import type { CoreContext } from '@intlify/core'

const messages = {
  en: { hello: 'hello, {name}', nav: { home: 'Home' } },
  ja: { hello: 'こんにちは, {name}' }
}

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
    expect(context.localeFallbacker).toBe(fallbackWithLocaleChain)
    // placeholders need the compiler, nested keys need the resolver, and `ja-JP` -> `ja` needs the locale chain of the fallbacker
    expect(translate(context, 'hello', { name: 'srvmid' })).toBe('こんにちは, srvmid')
    expect(translate(context, 'nav.home')).toBe('Home')
    expect(warn.mock.calls.flat().join('\n')).not.toContain('Custom Message Compiler')
  })

  test('keeps what users register', () => {
    const resolver = vi.fn<typeof resolveValue>(resolveValue)
    registerMessageResolver(resolver)
    const context = createIntlifyCoreContext({ locale: 'en', messages }) as CoreContext
    expect(context.messageResolver).toBe(resolver)
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
    expect(context.localeFallbacker).toBe(fallbackWithLocaleChain)
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
