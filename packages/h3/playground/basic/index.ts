import { H3 } from 'h3'
import { serve } from 'srvx'
import {
  detectLocaleFromAcceptLanguageHeader,
  plugin as i18n,
  useTranslation
} from '../../src/index.ts' // `@inlify/h3`

const app = new H3({
  plugins: [
    i18n({
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
