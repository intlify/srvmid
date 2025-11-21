import { Hono } from 'hono'
import { serve } from 'srvx'
import {
  defineIntlifyMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  useTranslation
} from '../../src/index.ts' // `@inlify/hono`

const intlify = defineIntlifyMiddleware({
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

const app: Hono = new Hono()
app.use('*', intlify)
app.get('/', async c => {
  const t = await useTranslation(c)
  return c.text(t('hello', { name: 'hono' }) + `\n`)
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
