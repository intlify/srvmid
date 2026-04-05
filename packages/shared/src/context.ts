/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { getEventContext } from 'h3'
import { SYMBOL_INTLIFY, SYMBOL_INTLIFY_LOCALE } from './symbols.ts'

import type { CoreContext, LocaleDetector } from '@intlify/core'
import type { H3EventContext, HTTPEvent } from 'h3'

declare module 'h3' {
  interface H3EventContext {
    [SYMBOL_INTLIFY]?: CoreContext
    [SYMBOL_INTLIFY_LOCALE]?: LocaleDetector
  }
}

export async function getLocaleAndEventContext(
  event: HTTPEvent
): Promise<[string, H3EventContext]> {
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

export async function getDetectorLocale(event: HTTPEvent): Promise<Intl.Locale> {
  const result = await getLocaleAndEventContext(event)
  return new Intl.Locale(result[0])
}
