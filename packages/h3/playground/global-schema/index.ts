import { eventHandler, H3, toNodeListener } from 'h3'
import { createServer } from 'node:http'
import {
  defineI18nMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  useTranslation
} from '../../src/index.ts' // in your project, `import { ... } from '@inlify/h3'`

import en from './locales/en.ts'
import ja from './locales/ja.ts'

// 'en' resource is master schema
type ResourceSchema = typeof en

// you can put the type extending with `declare module` as global resource schema
declare module '../../src/index.ts' {
  // please use `declare module '@intlifly/h3'`, if you want to use global resource schema in your project.
  export interface DefineLocaleMessage extends ResourceSchema {}
}
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
    const t = await useTranslation(event)
    return t('hello', { name: 'h3' })
  })
)

createServer(toNodeListener(app)).listen(3000)
