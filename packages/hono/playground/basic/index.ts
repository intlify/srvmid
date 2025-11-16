import { Hono } from 'hono'
import { serve } from 'srvx'
import {
  defineI18nMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  useTranslation
} from '../../src/index.ts' // `@inlify/hono`

const i18n = defineI18nMiddleware({
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
app.use('*', i18n)
app.get('/', async c => {
  const t = await useTranslation(c)
  return c.text(t('hello', { name: 'hono' }) + `\n`)
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
