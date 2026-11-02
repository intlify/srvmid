/**
 * Internationalization middleware & utilities for Nitro
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  DEFAULT_LOCALE,
  translate as _translate,
  NOT_REOSLVED,
  // @ts-expect-error -- NOTE(kazupon): internal function
  parseTranslateArgs
} from '@intlify/core'
import { tryHeaderLocale } from '@intlify/utils'
import { definePlugin } from 'nitro'
import { getEventContext } from 'nitro/h3'
import {
  createGetDetectorLocale,
  createGetLocaleAndEventContext
} from '../../shared/src/context.ts'
import { createIntlifyCoreContext } from '../../shared/src/core.ts'
import { SYMBOL_INTLIFY, SYMBOL_INTLIFY_LOCALE } from '../../shared/src/symbols.ts'

export {
  getCookieLocale,
  getHeaderLanguage,
  getHeaderLanguages,
  getHeaderLocale,
  getHeaderLocales,
  getPathLocale,
  getQueryLocale,
  setCookieLocale,
  tryCookieLocale,
  tryHeaderLocale,
  tryHeaderLocales,
  tryPathLocale,
  tryQueryLocale
} from '../../shared/src/re-exports.ts'

export type { CoreContext } from '../../shared/src/re-exports.ts'

import type {
  CoreContext,
  CoreOptions,
  Locale,
  LocaleDetector,
  LocaleMessage,
  LocaleParams,
  SchemaParams
} from '@intlify/core'
import type { H3EventContext, HTTPEvent } from 'nitro/h3'
import type { NitroAppPlugin } from 'nitro/types'
import type {
  DefaultLocaleMessageSchema as _DefaultLocaleMessageSchema,
  TranslationFunction
} from '../../shared/src/types.ts'

declare module 'nitro/h3' {
  interface H3EventContext {
    [SYMBOL_INTLIFY]?: CoreContext
    [SYMBOL_INTLIFY_LOCALE]?: LocaleDetector
  }
}

type DefaultLocaleMessageSchema = _DefaultLocaleMessageSchema<DefineLocaleMessage>

interface IntlifyHooks {
  onRequest: (event: HTTPEvent) => void | Promise<void>
}

/**
 * Internationalization plugin options for Nitro
 *
 * @typeParam Schema - Locale message schema type, default is {@linkcode DefaultLocaleMessageSchema}
 * @typeParam Locales - Locale type, default is `string`
 * @typeParam Message - Message type, default is `string`
 */
export type IntlifyPluginOptions<
  Schema = DefaultLocaleMessageSchema,
  Locales = string,
  Message = string
> = CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>>

/**
 * Internationalization plugin for Nitro
 *
 * @param options - An `i18n` options like vue-i18n [`createI18n`]({@link https://vue-i18n.intlify.dev/guide/#javascript}), which are passed to `createCoreContext` of `@intlify/core`
 *
 * @returns A Nitro plugin that registers internationalization hooks
 *
 * @example
 * ```ts
 * // server/plugins/i18n.ts
 * import { intlify } from '@intlify/nitro'
 *
 * export default intlify({
 *   messages: {
 *     en: {
 *       hello: 'Hello {name}!',
 *     },
 *     ja: {
 *       hello: 'こんにちは、{name}！',
 *     },
 *   },
 *   locale: (event) => {
 *     // your locale detection logic here
 *   },
 * })
 * ```
 */
export function intlify<
  Schema = DefaultLocaleMessageSchema,
  Locales = string,
  Message = string,
  Options extends CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>> =
    CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>>
>(options: Options): NitroAppPlugin {
  return definePlugin(nitroApp => {
    const { onRequest } = createIntlifyHooks<Schema, Locales, Message, Options>(options)
    prepareEvent = onRequest
    nitroApp.hooks.hook('request', onRequest)
  })
}

/**
 * Create intlify hooks for Nitro
 *
 * @param options - An `i18n` options passed to `createCoreContext` of `@intlify/core`
 *
 * @returns An object containing the `onRequest` hook
 *
 * @internal
 */
function createIntlifyHooks<
  Schema = DefaultLocaleMessageSchema,
  Locales = string,
  Message = string,
  Options extends CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>> =
    CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>>
>(options: Options): IntlifyHooks {
  const intlify = createIntlifyCoreContext(options as unknown as CoreOptions)
  const orgLocale = intlify.locale

  let staticLocaleDetector: LocaleDetector | null = null
  if (typeof orgLocale === 'string') {
    console.warn(
      `'locale' option is static ${orgLocale} locale! you should specify dynamic locale detector function.`
    )
    staticLocaleDetector = () => orgLocale
  }

  const getLocaleDetector = (event: HTTPEvent, intlify: CoreContext): LocaleDetector => {
    return typeof orgLocale === 'function'
      ? orgLocale.bind(null, event, intlify)
      : staticLocaleDetector == null
        ? detectLocaleFromAcceptLanguageHeader.bind(null, event)
        : staticLocaleDetector.bind(null, event, intlify)
  }

  return {
    onRequest: event => {
      const context = getEventContext<H3EventContext>(event)
      context[SYMBOL_INTLIFY_LOCALE] = getLocaleDetector(event, intlify as CoreContext)
      context[SYMBOL_INTLIFY] = intlify as CoreContext
    }
  }
}

/**
 * Locale detection with `Accept-Language` header
 *
 * @example
 * ```ts
 * // server/plugins/i18n.ts
 * import { intlify, detectLocaleFromAcceptLanguageHeader } from '@intlify/nitro'
 *
 * export default intlify({
 *   messages: {
 *     en: {
 *       hello: 'Hello {name}!',
 *     },
 *     ja: {
 *       hello: 'こんにちは、{name}！',
 *     },
 *   },
 *   locale: detectLocaleFromAcceptLanguageHeader
 * })
 * ```
 *
 * @param event - A Nitro HTTP event
 *
 * @returns A locale string, which will be detected of **first** from `Accept-Language` header. `en-US` if the header has no language, or if the first language is not a valid language tag
 */
export const detectLocaleFromAcceptLanguageHeader = (event: HTTPEvent): Locale =>
  tryHeaderLocale(event.req)?.toString() ?? DEFAULT_LOCALE

/**
 * The type definition of Locale Message for `@intlify/nitro` package
 *
 * @example
 * ```ts
 * // type.d.ts (`.d.ts` file at your app)
 * import { DefineLocaleMessage } from '@intlify/nitro'
 *
 * declare module '@intlify/nitro' {
 *   export interface DefineLocaleMessage {
 *     title: string
 *     menu: {
 *       login: string
 *     }
 *   }
 * }
 * ```
 */
export interface DefineLocaleMessage extends LocaleMessage<string> {}

const getLocaleAndEventContext = createGetLocaleAndEventContext(getEventContext)

/**
 * The `request` hook of the intlify plugin, which prepares the event context.
 *
 * Nitro calls the `request` hooks in the order that the plugins register them, so a plugin that runs before the intlify plugin gets an event that is not prepared yet in its `request` hook. Nitro runs all the plugins before it handles requests, so `useTranslation` and `getDetectorLocale` prepare such an event with this hook.
 */
let prepareEvent: ((event: HTTPEvent) => void | Promise<void>) | undefined

async function prepare(event: HTTPEvent): Promise<void> {
  if (getEventContext<H3EventContext>(event)[SYMBOL_INTLIFY] == null) {
    await prepareEvent?.(event)
  }
}

function withPrepare<T>(fn: (event: HTTPEvent) => Promise<T>): (event: HTTPEvent) => Promise<T> {
  return async event => {
    await prepare(event)
    return fn(event)
  }
}

/**
 * Use translation function in event handler
 *
 * @example
 * ```ts
 * import { defineHandler } from 'nitro/h3'
 * import { useTranslation } from '@intlify/nitro'
 *
 * export default defineHandler(async (event) => {
 *   const t = await useTranslation(event)
 *   return t('hello', { name: 'Nitro' })
 * })
 * ```
 *
 * @param event - A Nitro HTTP event
 *
 * @returns Return a translation function, which can be translated with internationalization resource messages
 */
export async function useTranslation<
  Schema extends Record<string, any> = {},
  Event extends HTTPEvent = HTTPEvent
>(event: Event): Promise<TranslationFunction<Schema, DefineLocaleMessage>> {
  await prepare(event)
  const [locale, context] = await getLocaleAndEventContext(event)
  // keep the core context, so that the function also works after the response
  const coreContext = context[SYMBOL_INTLIFY]!
  function translate(key: string, ...args: unknown[]): string {
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- NOTE(kazupon): generic type
    const [_, options] = parseTranslateArgs(key, ...args)
    const [arg2] = args

    // oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment -- NOTE(kazupon): generic type
    const result = Reflect.apply(_translate, null, [
      coreContext,
      key,
      arg2,
      {
        locale,
        ...options
      }
    ])
    return NOT_REOSLVED === result ? key : (result as string)
  }

  return translate
}

export const getDetectorLocale: (event: HTTPEvent) => Promise<Intl.Locale> = withPrepare(
  createGetDetectorLocale(getEventContext)
)
