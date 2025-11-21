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
    intlify?: CoreContext
    intlifyLocaleDetector?: LocaleDetector
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
 * define intlify middleware for Hono
 *
 * @description
 * Define the middleware to be specified for Hono [`app.use`]({@link https://hono.dev/guides/middleware})
 *
 * @param options - An intlify options like vue-i18n [`createI18n`]({@link https://vue-i18n.intlify.dev/guide/#javascript}), which are passed to `createCoreContext` of `@intlify/core`, see about details [`CoreOptions` of `@intlify/core`](https://github.com/intlify/vue-i18n-next/blob/6a9947dd3e0fe90de7be9c87ea876b8779998de5/packages/core-base/src/context.ts#L196-L216)
 *
 * @returns A defined intlify middleware
 *
 * @example
 *
 * ```js
 * import { Hono } from 'hono'
 * import { defineIntlifyMiddleware } from '@intlify/hono'
 *
 * const intlify = defineIntlifyMiddleware({
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
 * app.use('*', intlify)
 * ```
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
>(options: Options): MiddlewareHandler {
  const intlify = createCoreContext(options as unknown as CoreOptions)
  const orgLocale = intlify.locale

  let staticLocaleDetector: LocaleDetector | null = null
  if (typeof orgLocale === 'string') {
    console.warn(
      `defineIntlifyMiddleware 'locale' option is static ${orgLocale} locale! you should specify dynamic locale detector function.`
    )
    staticLocaleDetector = () => orgLocale
  }

  const getLocaleDetector = (ctx: Context, intlify: CoreContext): LocaleDetector => {
    return typeof orgLocale === 'function'
      ? orgLocale.bind(null, ctx, intlify)
      : staticLocaleDetector == null
        ? detectLocaleFromAcceptLanguageHeader.bind(null, ctx)
        : staticLocaleDetector.bind(null, ctx, intlify)
  }

  return async (ctx: Context, next: Next) => {
    const detector = getLocaleDetector(ctx, intlify as CoreContext)
    intlify.locale = detector
    ctx.set('intlifyLocaleDetector', detector)
    ctx.set('intlify', intlify as CoreContext)

    await next()

    intlify.locale = orgLocale
    ctx.set('intlify', undefined)
    ctx.set('intlifyLocaleDetector', undefined)
  }
}

/**
 * locale detection with `Accept-Language` header
 *
 * @param c - A Hono context
 * @returns A locale string, which will be detected of **first** from `Accept-Language` header
 *
 * @example
 * ```js
 * import { Hono } from 'hono'
 * import { defineIntlifyMiddleware, detectLocaleFromAcceptLanguageHeader } from '@intlify/hono'
 *
 * const intlify = defineIntlifyMiddleware({
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
 * app.use('*', intlify)
 * ```
 */
export const detectLocaleFromAcceptLanguageHeader = (c: Context): Locale =>
  getHeaderLocale(c.req.raw).toString()

async function getLocaleAndIntlifyContext(ctx: Context): Promise<[string, CoreContext]> {
  const intlify = ctx.get('intlify')
  if (intlify == null) {
    throw new Error(
      'middleware not initialized, please setup `app.use` with the middleware obtained with `defineIntlifyMiddleware`'
    )
  }

  const localeDetector = ctx.get('intlifyLocaleDetector')
  if (localeDetector == null) {
    throw new Error(
      'locale detector not found in context, please make sure that the intlify middleware is correctly set up'
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
 * @param c - A Hono context
 * @returns Return a translation function, which can be translated with intlify resource messages
 *
 * @example
 * ```js
 * import { Hono } from 'hono'
 * import { defineIntlifyMiddleware } from '@intlify/hono'
 *
 * const intlify = defineIntlifyMiddleware({
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
 * app.use('*', intlify)
 * // setup other middlewares ...
 *
 * app.get('/', async (c) => {
 *   const t = await useTranslation(c)
 *   return c.text(t('hello', { name: 'hono' }))
 * })
 * ```
 */
export async function useTranslation<
  Schema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  HonoContext extends Context = Context
>(c: HonoContext): Promise<TranslationFunction<Schema, DefineLocaleMessage>> {
  const [locale, intlify] = await getLocaleAndIntlifyContext(c)
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
 * @description The locale obtainable via this function comes from the locale detector specified in the `locale` option of the {@link defineIntlifyMiddleware}.
 *
 * @example
 * ```js
 * app.get(
 *   '/',
 *   async c => {
 *     const locale = await getDetectorLocale(c)
 *     return c.text(`Current Locale: ${locale.language}`)
 *   },
 * )
 * ```
 *
 * @param c - A Hono context
 *
 * @returns Return an {@linkcode Intl.Locale} instance representing the detected locale
 */
export async function getDetectorLocale(c: Context): Promise<Intl.Locale> {
  const [locale] = await getLocaleAndIntlifyContext(c)
  return new Intl.Locale(locale)
}
