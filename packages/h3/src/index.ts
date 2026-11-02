/**
 * Internationalization middleware & utilities for h3
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
import { definePlugin, getEventContext, onRequest, onResponse } from 'h3'
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
import type { H3Event, H3EventContext, H3Plugin, HTTPEvent, Middleware } from 'h3'
import type {
  DefaultLocaleMessageSchema as _DefaultLocaleMessageSchema,
  TranslationFunction
} from '../../shared/src/types.ts'

declare module 'h3' {
  interface H3EventContext {
    [SYMBOL_INTLIFY]?: CoreContext
    [SYMBOL_INTLIFY_LOCALE]?: LocaleDetector
  }
}

type DefaultLocaleMessageSchema = _DefaultLocaleMessageSchema<DefineLocaleMessage>

/**
 * Internationalization middleware for H3
 */
export interface IntlifyMiddleware {
  /**
   * Request middleware which is defined with [`onRequest`](https://h3.dev/utils/more#onrequesthook)
   */
  onRequest: Middleware
  /**
   * Response middleware which is defined with [`onResponse`](https://h3.dev/utils/more#onresponsehook)
   *
   * @deprecated This middleware does nothing, because the event context lives only for the request. Register `onRequest` only. It will be removed in the next major version.
   */
  onResponse: Middleware
}

/**
 * Internationalization plugin options for H3
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
 * Internationalization plugin for H3
 *
 * @example
 * ```ts
 * import { H3 } from 'h3'
 * import { intlify } from '@intlify/h3'
 *
 * const app = new H3({
 *   plugins: [
 *     intlify({
 *       messages: {
 *         en: {
 *           hello: 'Hello {name}!',
 *         },
 *         ja: {
 *           hello: 'こんにちは、{name}！',
 *         },
 *       },
 *       // your locale detection logic here
 *       locale: (event) => {
 *         // ...
 *       },
 *     })
 *   ]
 * })
 */
export const intlify: (options: IntlifyPluginOptions) => H3Plugin =
  definePlugin<IntlifyPluginOptions>((h3, options) => {
    const { onRequest } = defineIntlifyMiddleware(options)
    h3.use(onRequest)
  })

/**
 * Define internationalization middleware for H3
 *
 * Define the middleware to be specified the bellows:
 *
 * - [`H3.use`]({@link https://h3.dev/guide/api/h3#h3use})
 *
 * @example
 *
 * ```js
 * import { H3 } from 'h3'
 * import { defineIntlifyMiddleware } from '@intlify/h3'
 *
 * const intlifyMiddleware = defineIntlifyMiddleware({
 *   messages: {
 *     en: {
 *       hello: 'Hello {name}!',
 *     },
 *     ja: {
 *       hello: 'こんにちは、{name}！',
 *     },
 *   },
 *   // your locale detection logic here
 *   locale: (event) => {
 *     // ...
 *   },
 * })
 *
 * const app = new H3()
 *   .use(intlifyMiddleware.onRequest) // register `onRequest` hook before your application middlewares
 * ```
 *
 * @param options - An `i18n` options like vue-i18n [`createI18n`]({@link https://vue-i18n.intlify.dev/guide/#javascript}), which are passed to `createCoreContext` of `@intlify/core`, see about details [`CoreOptions` of `@intlify/core`](https://github.com/intlify/vue-i18n-next/blob/6a9947dd3e0fe90de7be9c87ea876b8779998de5/packages/core-base/src/context.ts#L196-L216)
 *
 * @returns A defined internationalization middleware, which is included `onRequest` and `onResponse` options of `H3`. `onResponse` does nothing, and is deprecated
 *
 * @internal
 */
export function defineIntlifyMiddleware<
  Schema = DefaultLocaleMessageSchema,
  Locales = string,
  Message = string,
  Options extends CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>> =
    CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>>
>(options: Options): IntlifyMiddleware {
  const intlify = createIntlifyCoreContext(options as unknown as CoreOptions)
  const orgLocale = intlify.locale

  let staticLocaleDetector: LocaleDetector | null = null
  if (typeof orgLocale === 'string') {
    console.warn(
      `'locale' option is static ${orgLocale} locale! you should specify dynamic locale detector function.`
    )
    staticLocaleDetector = () => orgLocale
  }

  const getLocaleDetector = (event: H3Event, intlify: CoreContext): LocaleDetector => {
    return typeof orgLocale === 'function'
      ? orgLocale.bind(null, event, intlify)
      : staticLocaleDetector == null
        ? detectLocaleFromAcceptLanguageHeader.bind(null, event)
        : staticLocaleDetector.bind(null, event, intlify)
  }

  return {
    onRequest: onRequest(event => {
      const context = getEventContext<H3EventContext>(event)
      context[SYMBOL_INTLIFY_LOCALE] = getLocaleDetector(event, intlify as CoreContext)
      context[SYMBOL_INTLIFY] = intlify as CoreContext
    }),
    // nothing to clean up, because the event context lives only for the request. Kept for compatibility
    onResponse: onResponse(() => {})
  }
}

/**
 * Locale detection with `Accept-Language` header
 *
 * @example
 * ```js
 * import { H3 } from 'h3'
 * import { defineIntlifyMiddleware, detectLocaleFromAcceptLanguageHeader } from '@intlify/h3'
 *
 * const intlifyMiddleware = defineIntlifyMiddleware({
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
 *
 * const app = new H3()
 *   .use(intlifyMiddleware.onRequest)
 * ```
 *
 * @param event - A H3 event
 *
 * @returns A locale string, which will be detected of **first** from `Accept-Language` header. `en-US` if the header has no language, or if the first language is not a valid language tag
 */
export const detectLocaleFromAcceptLanguageHeader = (event: H3Event): Locale =>
  tryHeaderLocale(event.req)?.toString() ?? DEFAULT_LOCALE

/**
 * The type definition of Locale Message for `@intlify/h3` package
 *
 * @example
 * ```ts
 * // type.d.ts (`.d.ts` file at your app)
 * import { DefineLocaleMessage } from '@intlify/h3'
 *
 * declare module '@intlify/h3' {
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
 * Use translation function in event handler
 *
 * @example
 * ```js
 * app.get(
 *   '/',
 *   async (event) => {
 *     const t = await useTranslation(event)
 *     return t('hello', { name: 'H3' })
 *   },
 * )
 * ```
 *
 * @param event - A H3 event
 *
 * @returns Return a translation function, which can be translated with internationalization resource messages
 */
export async function useTranslation<
  Schema extends Record<string, any> = {},
  Event extends H3Event = H3Event
>(event: Event): Promise<TranslationFunction<Schema, DefineLocaleMessage>> {
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
        // bind to request locale
        locale,
        ...options
      }
    ])
    return NOT_REOSLVED === result ? key : (result as string)
  }

  return translate
}

export const getDetectorLocale: (event: HTTPEvent) => Promise<Intl.Locale> =
  createGetDetectorLocale(getEventContext)
