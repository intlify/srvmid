/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  compile,
  createCoreContext,
  fallbackWithLocaleChain,
  fallbackWithSimple,
  resolveValue,
  resolveWithKeyValue
} from '@intlify/core'

import type { CoreOptions, FallbackLocale, Locale, LocaleFallbacker } from '@intlify/core'

/**
 * The number of locales whose fallback chains a core context keeps
 */
const LOCALE_CHAIN_CACHE_SIZE = 1000

/**
 * Create a locale fallbacker that works like `fallbackWithLocaleChain` of `@intlify/core`, with a cache of a limited size.
 *
 * `fallbackWithLocaleChain` caches the chain on the context for each locale that it is asked for, and never drops it.
 * The packages translate all requests with one context, and the locale comes from each request, so that cache grows with the number of locales that requests ask for.
 * This keeps the chains of up to `size` locales, and drops the one used least recently. When the fallback locales change, it starts over.
 *
 * @param size - The number of locales whose chains are kept
 * @returns A locale fallbacker
 */
export function createLocaleChainFallbacker(
  size: number = LOCALE_CHAIN_CACHE_SIZE
): LocaleFallbacker {
  const cache = new Map<Locale, Locale[]>()
  let cachedFallback: FallbackLocale | undefined
  return (_context: unknown, fallback: FallbackLocale, start: Locale): Locale[] => {
    // the chains depend on the fallback locales
    if (fallback !== cachedFallback) {
      cache.clear()
      cachedFallback = fallback
    }
    const cached = cache.get(start)
    if (cached != null) {
      // move it to the end, as the most recently used
      cache.delete(start)
      cache.set(start, cached)
      return cached
    }
    // pass a new object, so that `fallbackWithLocaleChain` keeps nothing in its own cache
    const chain = fallbackWithLocaleChain({} as Parameters<LocaleFallbacker>[0], fallback, start)
    if (size > 0) {
      if (cache.size >= size) {
        cache.delete(cache.keys().next().value as Locale)
      }
      cache.set(start, chain)
    }
    return chain
  }
}

/**
 * `createCoreContext` of `@intlify/core`, which also works when the registration of `@intlify/core` is missing.
 *
 * `@intlify/core` v11 registers the message compiler, the message resolver, and the locale fallbacker when it is loaded, but a bundler can drop that registration (a module side effect), and then the messages are not translated.
 * This sets them on the context only when they are missing. It does not pass them as options, because a `messageCompiler` option makes `@intlify/core` v11 warn that it is experimental, and options take precedence over what users register with `register*`.
 * The built-in `resolveWithKeyValue` and `fallbackWithSimple` count as missing, because `createCoreContext` uses them when nothing is registered. To use them, pass them with the `messageResolver` and `localeFallbacker` options.
 * In place of `fallbackWithLocaleChain` and `fallbackWithSimple`, the context gets a locale fallbacker that works like `fallbackWithLocaleChain` with a cache of a limited size (see {@link createLocaleChainFallbacker}). A locale fallbacker that users pass is kept. One that users register is kept too, except `fallbackWithLocaleChain` and `fallbackWithSimple`: they are replaced even when users register them, because `@intlify/core` registers `fallbackWithLocaleChain` itself. To keep one of them, pass it with the `localeFallbacker` option.
 *
 * @param options - The options of `createCoreContext`
 * @returns A core context
 */
export const createIntlifyCoreContext: typeof createCoreContext = ((options: CoreOptions) => {
  const context = createCoreContext(options)
  if (context.messageCompiler == null) {
    context.messageCompiler = compile
  }
  // `createCoreContext` falls back to these built-in ones when nothing is registered
  if (options.messageResolver == null && context.messageResolver === resolveWithKeyValue) {
    context.messageResolver = resolveValue
  }
  // and `@intlify/core` registers `fallbackWithLocaleChain`, whose cache has no limit
  if (
    options.localeFallbacker == null &&
    (context.localeFallbacker === fallbackWithSimple ||
      context.localeFallbacker === fallbackWithLocaleChain)
  ) {
    context.localeFallbacker = createLocaleChainFallbacker()
  }
  return context
}) as typeof createCoreContext
