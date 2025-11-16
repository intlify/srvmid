import { Hono } from 'hono'
import { serve } from 'srvx'
import { getHeaderLocale } from '../../src/index.ts' // `@intlify/hono`

const app = new Hono()

app.get('/', c => {
  const locale = getHeaderLocale(c.req.raw)
  return c.text(locale.toString())
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
