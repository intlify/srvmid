/**
 * Internationalization for Elysia
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
  DEFAULT_LOCALE,
  NOT_REOSLVED,
  // @ts-expect-error -- NOTE(kazupon): internal function
  parseTranslateArgs
} from '@intlify/core'
import { getHeaderLocale } from '@intlify/utils'
import { Elysia } from 'elysia'

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

import type {
  CoreOptions,
  IsEmptyObject,
  Locale,
  LocaleDetector,
  LocaleMessage,
  LocaleParams,
  RemoveIndexSignature,
  SchemaParams
} from '@intlify/core'
import type { Context as ElysiaContext, PreContext as ElysiaPreContext } from 'elysia'
import type { TranslationFunction } from '../../shared/src/types.ts'

type DefaultLocaleMessageSchema<
  Schema = RemoveIndexSignature<{
    [K in keyof DefineLocaleMessage]: DefineLocaleMessage[K]
  }>
> = IsEmptyObject<Schema> extends true ? LocaleMessage<string> : Schema

/**
 * The type definition of Locale Message for `@intlify/elysia` package
 *
 * @description
 * The typealias is used to strictly define the type of the Locale message.
 *
 * @example
 * ```ts
 * // type.d.ts (`.d.ts` file at your app)
 * import { DefineLocaleMessage } from '@intlify/elysia'
 *
 * declare module '@intlify/elysia' {
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
 * Internationalization plugin for Elysia
 *
 * @description
 * This plugin uses Elysia's Context and extends it to export the following from the Context:
 *
 * - `locale`: A locale of Request, this locale is detected by Elysia's {@link https://elysiajs.com/patterns/extends-context.html#resolve | resolve} using the locale detector specified in the plugin's `locale` option.
 * - `translate`: A {@link TranslationFunction | translate fucntion}, that translates based on the `messages` options specified in the plugin options and the detected locale.
 * - `translate`: A {@link TranslationFunction | translate function}, that translates based on the `messages` options specified in the plugin options and the detected locale.
 *
 * @param options - An internationalization options like vue-i18n [`createI18n`]({@link https://vue-i18n.intlify.dev/guide/#javascript}), which are passed to `createCoreContext` of `@intlify/core`, see about details [`CoreOptions` of `@intlify/core`](https://github.com/intlify/vue-i18n-next/blob/6a9947dd3e0fe90de7be9c87ea876b8779998de5/packages/core-base/src/context.ts#L196-L216)
 *
 * @returns An Elysia plugin instance
 *
 * @example
 *
 * ```js
 * import { Elysia } from 'elysia'
 * import { intlify } from '@intlify/elysia'
 *
 * new Elysia()
 *   .use(
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
 *       locale: (ctx) => {
 *         // ...
 *       },
 *     })
 *   )
 *   .get('/', ctx => {
 *     // extended `locale` on Elysia Context
 *     console.log('current locale', ctx.locale)
 *     // extended `translate` on Elysia Context
 *     return ctx.translate('hello', { name: 'Elysia' })
 *   })
 * ```
 */
export function intlify<
  Schema extends Record<string, any> = DefaultLocaleMessageSchema, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  Locales = string,
  Message = string,
  Options extends CoreOptions<
    Message,
    SchemaParams<Schema, Message>,
    LocaleParams<Locales>
  > = CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>>
>(options: Options) {
  const intlify = createCoreContext(options as unknown as CoreOptions)
  const orgLocale = intlify.locale

  let staticLocaleDetector: LocaleDetector | null = null
  if (typeof orgLocale === 'string') {
    staticLocaleDetector = () => orgLocale
  }

  const getLocaleDetector = (
    elysia: ElysiaContext | ElysiaPreContext,
    intl: typeof intlify
  ): LocaleDetector => {
    return typeof orgLocale === 'function'
      ? orgLocale.bind(null, elysia, intl)
      : staticLocaleDetector == null
        ? detectLocaleFromAcceptLanguageHeader.bind(null, elysia as ElysiaContext)
        : staticLocaleDetector.bind(null, elysia, intl)
  }

  const noopTranslate = (key: string): string => {
    return key
  }

  return new Elysia({ name: 'intlify-elysia' })
    .decorate('locale', DEFAULT_LOCALE)
    .decorate('translate', noopTranslate as TranslationFunction)
    .resolve({ as: 'global' }, async ctx => {
      const localeDetector = getLocaleDetector(ctx as ElysiaContext, intlify)
      const locale = (ctx.locale = await localeDetector(ctx))
      function t(key: string, ...args: unknown[]): string {
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
      return {
        translate: t as TranslationFunction<Schema, DefineLocaleMessage>
      }
    })
}

/**
 * locale detection with `Accept-Language` header
 *
 * @param ctx - An Elysia context
 * @returns A locale string, which will be detected of **first** from `Accept-Language` header
 *
 * @example
 * ```js
 * import { Elysia } from 'elysia'
 * import { intlify, detectLocaleFromAcceptLanguageHeader } from '@intlify/elysia'
 *
 * new Elysia()
 *   .use(
 *     intlify({
 *       messages: {
 *         en: {
 *           hello: 'Hello {name}!',
 *         },
 *         ja: {
 *           hello: 'こんにちは、{name}！',
 *         },
 *       },
 *       locale: detectLocaleFromAcceptLanguageHeader
 *     })
 *   )
 * ```
 */
export const detectLocaleFromAcceptLanguageHeader = (ctx: ElysiaContext): Locale =>
  getHeaderLocale(ctx.request).toString()
