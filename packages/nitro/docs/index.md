**@intlify/nitro**

---

# @intlify/nitro

Internationalization middleware & utilities for Nitro

## Functions

| Function                                                                                  | Description                                     |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [detectLocaleFromAcceptLanguageHeader](functions/detectLocaleFromAcceptLanguageHeader.md) | Locale detection with `Accept-Language` header  |
| [getCookieLocale](functions/getCookieLocale.md)                                           | get locale from cookie                          |
| [getDetectorLocale](functions/getDetectorLocale.md)                                       | -                                               |
| [getHeaderLanguage](functions/getHeaderLanguage.md)                                       | get language from header                        |
| [getHeaderLanguages](functions/getHeaderLanguages.md)                                     | get languages from header                       |
| [getHeaderLocale](functions/getHeaderLocale.md)                                           | get locale from header                          |
| [getHeaderLocales](functions/getHeaderLocales.md)                                         | get locales from header                         |
| [getPathLocale](functions/getPathLocale.md)                                               | get the locale from the path                    |
| [getQueryLocale](functions/getQueryLocale.md)                                             | get the locale from the query                   |
| [intlify](functions/intlify.md)                                                           | Internationalization plugin for Nitro           |
| [setCookieLocale](functions/setCookieLocale.md)                                           | set locale to the response `Set-Cookie` header. |
| [tryCookieLocale](functions/tryCookieLocale.md)                                           | try to get locale from cookie                   |
| [tryHeaderLocale](functions/tryHeaderLocale.md)                                           | try to get locale from header                   |
| [tryHeaderLocales](functions/tryHeaderLocales.md)                                         | try to get locales from header                  |
| [tryPathLocale](functions/tryPathLocale.md)                                               | try to get the locale from the path             |
| [tryQueryLocale](functions/tryQueryLocale.md)                                             | try to get the locale from the query            |
| [useTranslation](functions/useTranslation.md)                                             | Use translation function in event handler       |

## Interfaces

| Interface                                                | Description                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------ |
| [DefineLocaleMessage](interfaces/DefineLocaleMessage.md) | The type definition of Locale Message for `@intlify/nitro` package |

## Type Aliases

| Type Alias                                                   | Description                                   |
| ------------------------------------------------------------ | --------------------------------------------- |
| [CoreContext](type-aliases/CoreContext.md)                   | -                                             |
| [IntlifyPluginOptions](type-aliases/IntlifyPluginOptions.md) | Internationalization plugin options for Nitro |
