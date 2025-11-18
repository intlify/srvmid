import { Elysia } from 'elysia'
import { serve } from 'srvx'
import { detectLocaleFromAcceptLanguageHeader, intlify } from '../../src/index.ts' // in your project, `import { ... } from '@intlify/elysia'`

import en from './locales/en.ts'
import ja from './locales/ja.ts'

type ResourceSchema = typeof en

const app = new Elysia()
  .use(
    // you can put the type extending with type argument of plugin as locale resource schema
    intlify<ResourceSchema>({
      locale: detectLocaleFromAcceptLanguageHeader,
      messages: {
        en,
        ja
      }
    })
  )
  .get('/', ctx => {
    return ctx.translate('hi', { name: 'elysia' })
  })

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
