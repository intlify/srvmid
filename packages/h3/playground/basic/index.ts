import { eventHandler, H3, toNodeListener } from 'h3'
import { createServer } from 'node:http'
import {
  defineI18nMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  useTranslation
} from '../../src/index.ts' // `@inlify/h3`

const { onRequest, onResponse } = defineI18nMiddleware({
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

const app = new H3()
app.use(onRequest)
app.use(onResponse)

app.get(
  '/',
  eventHandler(async event => {
    const t = await useTranslation(event)
    return t('hello', { name: 'h3' })
  })
)

createServer(toNodeListener(app)).listen(3000)
