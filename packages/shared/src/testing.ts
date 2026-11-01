/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  compile,
  fallbackWithLocaleChain,
  registerLocaleFallbacker,
  registerMessageCompiler,
  registerMessageResolver,
  resolveValue
} from '@intlify/core'

// The state of a bundle that dropped the registration of `@intlify/core` (its module side effect)
export function dropCoreRegistration(): void {
  registerMessageCompiler(undefined as never)
  registerMessageResolver(undefined as never)
  registerLocaleFallbacker(undefined as never)
}

// What `@intlify/core` v11 registers when it is loaded
export function restoreCoreRegistration(): void {
  registerMessageCompiler(compile)
  registerMessageResolver(resolveValue)
  registerLocaleFallbacker(fallbackWithLocaleChain)
}
