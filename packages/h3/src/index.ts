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
  translate as _translate,
  createCoreContext,
  NOT_REOSLVED,
  // @ts-expect-error -- NOTE(kazupon): internal function
  parseTranslateArgs
} from '@intlify/core'
import { getHeaderLocale } from '@intlify/utils'
import { definePlugin, onRequest, onResponse } from 'h3'
import { SYMBOL_I18N, SYMBOL_I18N_LOCALE } from './symbols.ts'

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
} from '@intlify/utils'

export type { CoreContext } from '@intlify/core'

import type {
  CoreContext,
  CoreOptions,
  IsEmptyObject,
  Locale,
  LocaleDetector,
  LocaleMessage,
  LocaleParams,
  NamedValue,
  PickupPaths,
  RemovedIndexResources,
  RemoveIndexSignature,
  SchemaParams,
  TranslateOptions
} from '@intlify/core'
import type { H3Event, Middleware } from 'h3'

declare module 'h3' {
  interface H3EventContext {
    [SYMBOL_I18N]?: CoreContext
    [SYMBOL_I18N_LOCALE]?: LocaleDetector
  }
}

type DefaultLocaleMessageSchema<
  Schema = RemoveIndexSignature<{
    [K in keyof DefineLocaleMessage]: DefineLocaleMessage[K]
  }>
> = IsEmptyObject<Schema> extends true ? LocaleMessage<string> : Schema

/**
 * Internationalization middleware for H3
 */
export interface I18nMiddleware {
  /**
   * Request middleware which is defined with [`onRequest`](https://h3.dev/utils/more#onrequesthook)
   */
  onRequest: Middleware
  /**
   * Response middleware which is defined with [`onResponse`](https://h3.dev/utils/more#onresponsehook)
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
export type I18nPluginOptions<
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
 * import { plugin as i18n } from '@intlify/h3'
 *
 * const app = new H3({
 *   plugins: [
 *     i18n({
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
export const plugin = definePlugin<I18nPluginOptions>((h3, options) => {
  const { onRequest, onResponse } = defineI18nMiddleware(options)
  h3.use(onRequest)
  h3.use(onResponse)
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
 * import { defineI18nMiddleware } from '@intlify/h3'
 *
 * const i18nMiddleware = defineI18nMiddleware({
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
 *   .use(i18nMiddleware.onRequest) // register `onRequest` hook before your application middlewares
 *   .use(i18nMiddleware.onResponse) // register `onResponse` hook before your application middlewares
 * ```
 *
 * @param options - An `i18n` options like vue-i18n [`createI18n`]({@link https://vue-i18n.intlify.dev/guide/#javascript}), which are passed to `createCoreContext` of `@intlify/core`, see about details [`CoreOptions` of `@intlify/core`](https://github.com/intlify/vue-i18n-next/blob/6a9947dd3e0fe90de7be9c87ea876b8779998de5/packages/core-base/src/context.ts#L196-L216)
 *
 * @returns A defined internationalization middleware, which is included `onRequest` and `onResponse` options of `H3`
 *
 * @internal
 */
export function defineI18nMiddleware<
  Schema = DefaultLocaleMessageSchema,
  Locales = string,
  Message = string,
  Options extends CoreOptions<
    Message,
    SchemaParams<Schema, Message>,
    LocaleParams<Locales>
  > = CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>>
>(options: Options): I18nMiddleware {
  const i18n = createCoreContext(options as unknown as CoreOptions)
  const orgLocale = i18n.locale

  let staticLocaleDetector: LocaleDetector | null = null
  if (typeof orgLocale === 'string') {
    console.warn(
      `'locale' option is static ${orgLocale} locale! you should specify dynamic locale detector function.`
    )
    staticLocaleDetector = () => orgLocale
  }

  const getLocaleDetector = (event: H3Event, i18n: CoreContext): LocaleDetector => {
    return typeof orgLocale === 'function'
      ? orgLocale.bind(null, event, i18n)
      : staticLocaleDetector == null
        ? detectLocaleFromAcceptLanguageHeader.bind(null, event)
        : staticLocaleDetector.bind(null, event, i18n)
  }

  return {
    onRequest: onRequest(event => {
      event.context[SYMBOL_I18N_LOCALE] = getLocaleDetector(event, i18n as CoreContext)
      i18n.locale = event.context[SYMBOL_I18N_LOCALE]
      event.context[SYMBOL_I18N] = i18n as CoreContext
    }),
    onResponse: onResponse((_, event) => {
      i18n.locale = orgLocale
      delete event.context[SYMBOL_I18N]
    })
  }
}

/**
 * Locale detection with `Accept-Language` header
 *
 * @example
 * ```js
 * import { H3 } from 'h3'
 * import { defineI18nMiddleware, detectLocaleWithAcceeptLanguageHeader } from '@intlify/h3'
 *
 * const i18nMiddleware = defineI18nMiddleware({
 *   messages: {
 *     en: {
 *       hello: 'Hello {name}!',
 *     },
 *     ja: {
 *       hello: 'こんにちは、{name}！',
 *     },
 *   },
 *   locale: detectLocaleWithAcceeptLanguageHeader
 * })
 *
 * const app = new H3()
 *   .use(i18nMiddleware.onRequest)
 *   .use(i18nMiddleware.onResponse)
 * ```
 *
 * @param event - A H3 event
 *
 * @returns A locale string, which will be detected of **first** from `Accept-Language` header
 */
export const detectLocaleFromAcceptLanguageHeader = (event: H3Event): Locale =>
  getHeaderLocale(event.req).toString()

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

type ResolveResourceKeys<
  Schema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  DefineLocaleMessageSchema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  DefinedLocaleMessage extends
    RemovedIndexResources<DefineLocaleMessageSchema> = RemovedIndexResources<DefineLocaleMessageSchema>,
  SchemaPaths = IsEmptyObject<Schema> extends false
    ? PickupPaths<{ [K in keyof Schema]: Schema[K] }>
    : never,
  DefineMessagesPaths = IsEmptyObject<DefinedLocaleMessage> extends false
    ? PickupPaths<{
        [K in keyof DefinedLocaleMessage]: DefinedLocaleMessage[K]
      }>
    : never
> = SchemaPaths | DefineMessagesPaths

/**
 * The translation function, which will be defined by {@link useTranslation}.
 */
interface TranslationFunction<
  Schema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  DefineLocaleMessageSchema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  ResourceKeys = ResolveResourceKeys<Schema, DefineLocaleMessageSchema>
> {
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @returns {string} A translated message, if the key is not found, return the key
   */
  <Key extends string>(key: Key | ResourceKeys): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {number} plural - A plural choice number
   * @returns {string} A translated message, if the key is not found, return the key
   */
  <Key extends string>(key: Key | ResourceKeys, plural: number): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {number} plural - A plural choice number
   * @param {TranslateOptions} options - A translate options, about details see {@link TranslateOptions}
   * @returns {string} A translated message, if the key is not found, return the key
   */
  <Key extends string>(key: Key | ResourceKeys, plural: number, options: TranslateOptions): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {string} defaultMsg - A default message, if the key is not found
   * @returns {string} A translated message, if the key is not found, return the `defaultMsg` argument
   */
  <Key extends string>(key: Key | ResourceKeys, defaultMsg: string): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {string} defaultMsg - A default message, if the key is not found
   * @param {TranslateOptions} options - A translate options, about details see {@link TranslateOptions}
   * @returns {string} A translated message, if the key is not found, return the `defaultMsg` argument
   */
  <Key extends string>(
    key: Key | ResourceKeys,
    defaultMsg: string,
    options: TranslateOptions
  ): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {unknown[]} list - A list for list interpolation
   * @returns {string} A translated message, if the key is not found, return the key
   */
  <Key extends string>(key: Key | ResourceKeys, list: unknown[]): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {unknown[]} list - A list for list interpolation
   * @param {number} plural - A plural choice number
   * @returns {string} A translated message, if the key is not found, return the key
   */
  <Key extends string>(key: Key | ResourceKeys, list: unknown[], plural: number): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {unknown[]} list - A list for list interpolation
   * @param {string} defaultMsg - A default message, if the key is not found
   * @returns {string} A translated message, if the key is not found, return the `defaultMsg` argument
   */
  <Key extends string>(key: Key | ResourceKeys, list: unknown[], defaultMsg: string): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {unknown[]} list - A list for list interpolation
   * @param {TranslateOptions} options - A translate options, about details see {@link TranslateOptions}
   * @returns {string} A translated message, if the key is not found, return the key
   */
  <Key extends string>(key: Key | ResourceKeys, list: unknown[], options: TranslateOptions): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {NamedValue} named - A named value for named interpolation
   * @returns {string} A translated message, if the key is not found, return the key
   */
  <Key extends string>(key: Key | ResourceKeys, named: NamedValue): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {NamedValue} named - A named value for named interpolation
   * @param {number} plural - A plural choice number
   * @returns {string} A translated message, if the key is not found, return the key
   */
  <Key extends string>(key: Key | ResourceKeys, named: NamedValue, plural: number): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {NamedValue} named - A named value for named interpolation
   * @param {string} defaultMsg - A default message, if the key is not found
   * @returns {string} A translated message, if the key is not found, return the `defaultMsg` argument
   */
  <Key extends string>(key: Key | ResourceKeys, named: NamedValue, defaultMsg: string): string
  /**
   * @param {Key | ResourceKeys} key - A translation key
   * @param {NamedValue} named - A named value for named interpolation
   * @param {TranslateOptions} options - A translate options, about details see {@link TranslateOptions}
   * @returns {string} A translated message, if the key is not found, return the key
   */
  <Key extends string>(
    key: Key | ResourceKeys,
    named: NamedValue,
    options: TranslateOptions
  ): string
}

/**
 * Use translation function in event handler
 *
 * @example
 * ```js
 * app.get(
 *   '/',
 *   eventHandler(async (event) => {
 *     const t = await useTranslation(event)
 *     return t('hello', { name: 'H3' })
 *   }),
 * )
 * ```
 *
 * @param event - A H3 event
 *
 * @returns Return a translation function, which can be translated with internationalization resource messages
 */
export async function useTranslation<
  Schema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  Event extends H3Event = H3Event
>(event: Event): Promise<TranslationFunction<Schema, DefineLocaleMessage>> {
  if (event.context[SYMBOL_I18N] == null) {
    throw new Error(
      'middleware not initialized, please setup `onRequest` and `onResponse` options of `H3` with the middleware obtained with `defineI18nMiddleware`'
    )
  }

  const localeDetector = event.context[SYMBOL_I18N_LOCALE] as unknown as LocaleDetector
  // Always await detector call - works for both sync and async detectors
  // (awaiting a non-promise value returns it immediately)
  const locale = await localeDetector(event)
  event.context[SYMBOL_I18N].locale = locale

  function translate(key: string, ...args: unknown[]): string {
    const [_, options] = parseTranslateArgs(key, ...args)
    const [arg2] = args

    const result = Reflect.apply(_translate, null, [
      event.context[SYMBOL_I18N]!,
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

  return translate as TranslationFunction<Schema, DefineLocaleMessage>
}
