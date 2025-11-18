import type {
  IsEmptyObject,
  NamedValue,
  PickupPaths,
  RemovedIndexResources,
  TranslateOptions
} from '@intlify/core'

type ResolveResourceKeys<
  Schema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  DefineLocaleMessageSchema extends Record<string, any> = {}, // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  DefinedLocaleMessage extends
    RemovedIndexResources<DefineLocaleMessageSchema> = RemovedIndexResources<DefineLocaleMessageSchema>,
  SchemaPaths = IsEmptyObject<Schema> extends false
    ? PickupPaths<{ [K in keyof Schema]: Schema[K] }>
    : never,
  DefineMessagesPaths = IsEmptyObject<DefinedLocaleMessage> extends false
    ? PickupPaths<{ [K in keyof DefinedLocaleMessage]: DefinedLocaleMessage[K] }>
    : never
> = SchemaPaths | DefineMessagesPaths

/**
 * The translation function, which will be defined by translation
 */
export interface TranslationFunction<
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
