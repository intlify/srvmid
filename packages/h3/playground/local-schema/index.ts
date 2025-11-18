import { H3 } from 'h3'
import { serve } from 'srvx'
import { detectLocaleFromAcceptLanguageHeader, intlify, useTranslation } from '../../src/index.ts' // in your project, `import { ... } from '@intlify/h3'`

import en from './locales/en.ts'
import ja from './locales/ja.ts'

const app = new H3({
  plugins: [
    intlify({
      locale: detectLocaleFromAcceptLanguageHeader,
      messages: {
        en,
        ja
      }
    })
  ]
})

app.get('/', async event => {
  type ResourceSchema = {
    hello: string
  }
  const t = await useTranslation<ResourceSchema>(event)
  return t('hello', { name: 'h3' })
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
