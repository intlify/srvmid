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
  resolveValue,
  compile,
  fallbackWithLocaleChain,
  // @ts-expect-error -- NOTE(kazupon): internal function
  parseTranslateArgs
} from '@intlify/core'
import { getHeaderLocale } from '@intlify/utils'
import { definePlugin, getEventContext, onRequest, onResponse } from 'h3'
import { SYMBOL_INTLIFY, SYMBOL_INTLIFY_LOCALE } from './symbols.ts'

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
  RemoveIndexSignature,
  SchemaParams
} from '@intlify/core'
import type { H3Event, H3EventContext, Middleware } from 'h3'
import type { TranslationFunction } from '../../shared/src/types.ts'

declare module 'h3' {
  interface H3EventContext {
    [SYMBOL_INTLIFY]?: CoreContext
    [SYMBOL_INTLIFY_LOCALE]?: LocaleDetector
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
export interface IntlifyMiddleware {
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
export const intlify = definePlugin<IntlifyPluginOptions>((h3, options) => {
  const { onRequest, onResponse } = defineIntlifyMiddleware(options)
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
 *   .use(intlifyMiddleware.onResponse) // register `onResponse` hook before your application middlewares
 * ```
 *
 * @param options - An `i18n` options like vue-i18n [`createI18n`]({@link https://vue-i18n.intlify.dev/guide/#javascript}), which are passed to `createCoreContext` of `@intlify/core`, see about details [`CoreOptions` of `@intlify/core`](https://github.com/intlify/vue-i18n-next/blob/6a9947dd3e0fe90de7be9c87ea876b8779998de5/packages/core-base/src/context.ts#L196-L216)
 *
 * @returns A defined internationalization middleware, which is included `onRequest` and `onResponse` options of `H3`
 *
 * @internal
 */
export function defineIntlifyMiddleware<
  Schema = DefaultLocaleMessageSchema,
  Locales = string,
  Message = string,
  Options extends CoreOptions<
    Message,
    SchemaParams<Schema, Message>,
    LocaleParams<Locales>
  > = CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>>
>(options: Options): IntlifyMiddleware {
  const intlify = createCoreContext(options as unknown as CoreOptions)
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
      intlify.locale = context[SYMBOL_INTLIFY_LOCALE]

      // @intlify/core has `sideEffects: false`. Some bundlers (like esbuild, used by cloudflare), may tree-shake the `register` calls in `core/src/index.ts`
      // To get around this, we can explicitly set the compiler, messageResolver, and localeFallbacker here
      intlify.messageCompiler = compile
      intlify.messageResolver = resolveValue
      intlify.localeFallbacker = fallbackWithLocaleChain

      context[SYMBOL_INTLIFY] = intlify as CoreContext
    }),
    onResponse: onResponse((_, event) => {
      intlify.locale = orgLocale
      const context = getEventContext<H3EventContext>(event)
      delete context[SYMBOL_INTLIFY]
      delete context[SYMBOL_INTLIFY_LOCALE]
    })
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
 *   .use(intlifyMiddleware.onResponse)
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

async function getLocaleAndEventContext(event: H3Event): Promise<[string, H3EventContext]> {
  const context = getEventContext<H3EventContext>(event)
  if (context[SYMBOL_INTLIFY] == null) {
    throw new Error(
      'plugin has not been initialized. Please check that the `intlify` plugin is installed correctly.'
    )
  }

  const localeDetector = context[SYMBOL_INTLIFY_LOCALE] as LocaleDetector
  // Always await detector call - works for both sync and async detectors
  // (awaiting a non-promise value returns it immediately)
  const locale = await localeDetector(event)
  return [locale, context]
}

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
  Schema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  Event extends H3Event = H3Event
>(event: Event): Promise<TranslationFunction<Schema, DefineLocaleMessage>> {
  const [locale, context] = await getLocaleAndEventContext(event)
  context[SYMBOL_INTLIFY]!.locale = locale
  function translate(key: string, ...args: unknown[]): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- NOTE(kazupon): generic type
    const [_, options] = parseTranslateArgs(key, ...args)
    const [arg2] = args

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- NOTE(kazupon): generic type
    const result = Reflect.apply(_translate, null, [
      context[SYMBOL_INTLIFY]!,
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

/**
 * get a locale which is detected with locale detector.
 *
 * @description The locale obtainable via this function comes from the locale detector specified in the `locale` option of the {@link intlify} plugin.
 *
 * @example
 * ```js
 * app.get(
 *   '/',
 *   async (event) => {
 *     const locale = await getDetectorLocale(event)
 *     return `Current Locale: ${locale.language}`
 *   },
 * )
 * ```
 * @param event - A H3 event
 *
 * @returns Return an {@linkcode Intl.Locale} instance representing the detected locale
 */
export async function getDetectorLocale(event: H3Event): Promise<Intl.Locale> {
  const result = await getLocaleAndEventContext(event)
  return new Intl.Locale(result[0])
}
