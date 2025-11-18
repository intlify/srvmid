import { Elysia } from 'elysia'
import { serve } from 'srvx'
import { detectLocaleFromAcceptLanguageHeader, intlify } from '../../src/index.ts' // in your project, `import { ... } from '@intlify/elysia'`

import en from './locales/en.ts'
import ja from './locales/ja.ts'

// 'en' resource is master schema
type ResourceSchema = typeof en

// you can put the type extending with `declare module` as global resource schema
declare module '../../src/index.ts' {
  // please use `declare module '@intlify/elysia'`, if you want to use global resource schema in your project.
  export interface DefineLocaleMessage extends ResourceSchema {}
}

const app = new Elysia()
  .use(
    intlify({
      locale: detectLocaleFromAcceptLanguageHeader,
      messages: {
        en,
        ja
      }
    })
  )
  .get('/', ctx => {
    return ctx.translate('hello', { name: 'elysia' })
  })

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
