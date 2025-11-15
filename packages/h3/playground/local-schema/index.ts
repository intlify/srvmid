import { eventHandler, H3, toNodeListener } from 'h3'
import { createServer } from 'node:http'
import {
  defineI18nMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  useTranslation
} from '../../src/index.ts' // in your project, `import { ... } from '@inlify/h3'`

import en from './locales/en.ts'
import ja from './locales/ja.ts'

const { onRequest, onResponse } = defineI18nMiddleware({
  locale: detectLocaleFromAcceptLanguageHeader,
  messages: {
    en,
    ja
  }
})

const app = new H3()
app.use(onRequest)
app.use(onResponse)

app.get(
  '/',
  eventHandler(async event => {
    type ResourceSchema = {
      hello: string
    }
    const t = await useTranslation<ResourceSchema>(event)
    return t('hello', { name: 'h3' })
  })
)

createServer(toNodeListener(app)).listen(3000)
