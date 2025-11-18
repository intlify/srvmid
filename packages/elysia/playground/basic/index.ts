import { Elysia } from 'elysia'
import { serve } from 'srvx'
import { detectLocaleFromAcceptLanguageHeader, intlify } from '../../src/index.ts' // `@intlify/elysia`

const app = new Elysia()
  .use(
    intlify({
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
  )
  .get('/', ctx => {
    return ctx.translate('hello', { name: 'elysia' })
  })

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
