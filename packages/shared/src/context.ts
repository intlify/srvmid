/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { SYMBOL_INTLIFY, SYMBOL_INTLIFY_LOCALE } from './symbols.ts'

import type { LocaleDetector } from '@intlify/core'
import type { H3EventContext, HTTPEvent } from 'h3'

// NOTE(kazupon): `declare module 'h3'` augmentation lives in each consumer
// package (packages/h3/src/index.ts for h3, packages/nitro/src/index.ts for
// nitro/h3) — declaring it here would bundle a runtime-irrelevant but still
// type-referencing reference to `'h3'` into `@intlify/nitro`'s output, and
// nitro consumers should augment `'nitro/h3'` rather than `'h3'`.

type GetEventContext = <T extends H3EventContext = H3EventContext>(event: HTTPEvent) => T

export function createGetLocaleAndEventContext(
  getEventContext: GetEventContext
): (event: HTTPEvent) => Promise<[string, H3EventContext]> {
  return async function getLocaleAndEventContext(event) {
    const context = getEventContext<H3EventContext>(event)
    if (context[SYMBOL_INTLIFY] == null) {
      throw new Error(
        'plugin has not been initialized. Please check that the `intlify` plugin is installed correctly.'
      )
    }

    const localeDetector = context[SYMBOL_INTLIFY_LOCALE] as LocaleDetector
    const locale = await localeDetector(event)
    return [locale, context]
  }
}

export function createGetDetectorLocale(
  getEventContext: GetEventContext
): (event: HTTPEvent) => Promise<Intl.Locale> {
  const getLocaleAndEventContext = createGetLocaleAndEventContext(getEventContext)
  return async function getDetectorLocale(event) {
    const result = await getLocaleAndEventContext(event)
    return new Intl.Locale(result[0])
  }
}
