import { Hono } from 'hono'
import {
  defineIntlifyMiddleware,
  detectLocaleFromAcceptLanguageHeader,
  useTranslation
} from '../../src/index.ts' // in your project, `import { ... } from '@inlify/hono'`

import en from './locales/en.ts'
import ja from './locales/ja.ts'

const intlify = defineIntlifyMiddleware({
  locale: detectLocaleFromAcceptLanguageHeader,
  messages: {
    en,
    ja
  }
})

const app: Hono = new Hono()
app.use('*', intlify)
app.get('/', async c => {
  type ResourceSchema = {
    hello: string
  }
  const t = await useTranslation<ResourceSchema>(c)
  return c.text(t('hello', { name: 'hono' }))
})

export default app
