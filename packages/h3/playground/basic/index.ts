import { H3 } from 'h3'
import { serve } from 'srvx'
import { detectLocaleFromAcceptLanguageHeader, intlify, useTranslation } from '../../src/index.ts' // `@intlify/h3`

const app = new H3({
  plugins: [
    intlify({
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
  ]
})

app.get('/', async event => {
  const t = await useTranslation(event)
  return t('hello', { name: 'h3' })
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
