/**
 * Internationalization middleware & utilities for Hono
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
  NOT_REOSLVED, // @ts-expect-error -- NOTE(kazupon): internal function
  parseTranslateArgs
} from '@intlify/core'
import { getHeaderLocale } from '@intlify/utils'

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
import type { Context, MiddlewareHandler, Next } from 'hono'
import type { TranslationFunction } from '../../shared/src/types.ts'

declare module 'hono' {
  interface ContextVariableMap {
    i18n?: CoreContext
    i18nLocaleDetector?: LocaleDetector
  }
}

type DefaultLocaleMessageSchema<
  Schema = RemoveIndexSignature<{
    [K in keyof DefineLocaleMessage]: DefineLocaleMessage[K]
  }>
> = IsEmptyObject<Schema> extends true ? LocaleMessage<string> : Schema

/**
 * The type definition of Locale Message for `@intlify/hono` package
 *
 * @description
 * The typealias is used to strictly define the type of the Locale message.
 *
 * @example
 * ```ts
 * // type.d.ts (`.d.ts` file at your app)
 * import { DefineLocaleMessage } from '@intlify/hono'
 *
 * declare module '@intlify/hono' {
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

/**
 * define i18n middleware for Hono
 *
 * @description
 * Define the middleware to be specified for Hono [`app.use`]({@link https://hono.dev/guides/middleware})
 *
 * @param options - An i18n options like vue-i18n [`createI18n`]({@link https://vue-i18n.intlify.dev/guide/#javascript}), which are passed to `createCoreContext` of `@intlify/core`, see about details [`CoreOptions` of `@intlify/core`](https://github.com/intlify/vue-i18n-next/blob/6a9947dd3e0fe90de7be9c87ea876b8779998de5/packages/core-base/src/context.ts#L196-L216)
 *
 * @returns A defined i18n middleware
 *
 * @example
 *
 * ```js
 * import { Hono } from 'hono'
 * import { defineI18nMiddleware } from '@intlify/hono'
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
 *   locale: (c) => {
 *     // ...
 *   },
 * })
 *
 * const app = new Hono()
 * app.use('*', i18nMiddleware)
 * ```
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
>(options: Options): MiddlewareHandler {
  const i18n = createCoreContext(options as unknown as CoreOptions)
  const orgLocale = i18n.locale

  let staticLocaleDetector: LocaleDetector | null = null
  if (typeof orgLocale === 'string') {
    console.warn(
      `defineI18nMiddleware 'locale' option is static ${orgLocale} locale! you should specify dynamic locale detector function.`
    )
    staticLocaleDetector = () => orgLocale
  }

  const getLocaleDetector = (ctx: Context, i18n: CoreContext): LocaleDetector => {
    return typeof orgLocale === 'function'
      ? orgLocale.bind(null, ctx, i18n)
      : staticLocaleDetector == null
        ? detectLocaleFromAcceptLanguageHeader.bind(null, ctx)
        : staticLocaleDetector.bind(null, ctx, i18n)
  }

  return async (ctx: Context, next: Next) => {
    const detector = getLocaleDetector(ctx, i18n as CoreContext)
    i18n.locale = detector
    ctx.set('i18nLocaleDetector', detector)
    ctx.set('i18n', i18n as CoreContext)

    await next()

    i18n.locale = orgLocale
    ctx.set('i18n', undefined)
    ctx.set('i18nLocaleDetector', undefined)
  }
}

/**
 * locale detection with `Accept-Language` header
 *
 * @param ctx - A Hono context
 * @returns A locale string, which will be detected of **first** from `Accept-Language` header
 *
 * @example
 * ```js
 * import { Hono } from 'hono'
 * import { defineI18nMiddleware, detectLocaleFromAcceptLanguageHeader } from '@intlify/hono'
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
 *   locale: detectLocaleFromAcceptLanguageHeader
 * })
 *
 * const app = new Hono()
 * app.use('*', i18nMiddleware)
 * ```
 */
export const detectLocaleFromAcceptLanguageHeader = (ctx: Context): Locale =>
  getHeaderLocale(ctx.req.raw).toString()

async function getLocaleAndIntlifyContext(ctx: Context): Promise<[string, CoreContext]> {
  const intlify = ctx.get('i18n')
  if (intlify == null) {
    throw new Error(
      'middleware not initialized, please setup `app.use` with the middleware obtained with `defineI18nMiddleware`'
    )
  }

  const localeDetector = ctx.get('i18nLocaleDetector')
  if (localeDetector == null) {
    throw new Error(
      'locale detector not found in context, please make sure that the i18n middleware is correctly set up'
    )
  }

  // Always await detector call - works for both sync and async detectors
  // (awaiting a non-promise value returns it immediately)
  const locale = await localeDetector(ctx)

  return [locale, intlify]
}

/**
 * use translation function in handler
 *
 * @param ctx - A Hono context
 * @returns Return a translation function, which can be translated with i18n resource messages
 *
 * @example
 * ```js
 * import { Hono } from 'hono'
 * import { defineI18nMiddleware } from '@intlify/hono'
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
 * })
 *
 * const app = new Hono()
 * app.use('*', i18nMiddleware)
 * // setup other middlewares ...
 *
 * app.get('/', async (ctx) => {
 *   const t = await useTranslation(ctx)
 *   return ctx.text(t('hello', { name: 'hono' }))
 * })
 * ```
 */
export async function useTranslation<
  Schema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  HonoContext extends Context = Context
>(ctx: HonoContext): Promise<TranslationFunction<Schema, DefineLocaleMessage>> {
  const [locale, intlify] = await getLocaleAndIntlifyContext(ctx)
  intlify.locale = locale
  function translate(key: string, ...args: unknown[]): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- NOTE(kazupon): generic type
    const [_, options] = parseTranslateArgs(key, ...args)
    const [arg2] = args

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- NOTE(kazupon): generic type
    const result = Reflect.apply(_translate, null, [
      intlify,
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
 * @description The locale obtainable via this function comes from the locale detector specified in the `locale` option of the {@link defineI18nMiddleware}.
 *
 * @example
 * ```js
 * app.get(
 *   '/',
 *   async ctx => {
 *     const locale = await getDetectorLocale(ctx)
 *     return ctx.text(`Current Locale: ${locale.language}`)
 *   },
 * )
 * ```
 *
 * @param ctx - A Hono context
 *
 * @returns Return an {@linkcode Intl.Locale} instance representing the detected locale
 */
export async function getDetectorLocale(ctx: Context): Promise<Intl.Locale> {
  const [locale] = await getLocaleAndIntlifyContext(ctx)
  return new Intl.Locale(locale)
}
