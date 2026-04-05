import { detectLocaleFromAcceptLanguageHeader, intlify } from '../../../../src/index.ts' // `@intlify/nitro`

export default intlify({
  locale: detectLocaleFromAcceptLanguageHeader,
  messages: {
    en: {
      hello: 'hello, {name}'
    },
    ja: {
      hello: 'こんにちは, {name}'
    }
  }
})
