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

import type { CoreOptions } from '@intlify/core'

/**
 * `createCoreContext` of `@intlify/core`, which also works when the registration of `@intlify/core` is missing.
 *
 * `@intlify/core` v11 registers the message compiler, the message resolver, and the locale fallbacker when it is loaded, but a bundler can drop that registration (a module side effect), and then the messages are not translated.
 * This sets them on the context only when they are missing. It does not pass them as options, because a `messageCompiler` option makes `@intlify/core` v11 warn that it is experimental, and options take precedence over what users register with `register*`.
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
  if (options.localeFallbacker == null && context.localeFallbacker === fallbackWithSimple) {
    context.localeFallbacker = fallbackWithLocaleChain
  }
  return context
}) as typeof createCoreContext
