import { H3 } from 'h3'
import { serve } from 'srvx'
import { getQueryLocale } from '../../src/index.ts' // `@intlify/h3`

const app = new H3()

app.get('/', event => {
  const locale = getQueryLocale(event.req)
  return locale.toString()
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
