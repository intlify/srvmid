import { H3 } from 'h3'
import { serve } from 'srvx'
import { getHeaderLocale } from '../../src/index.ts' // `@inlify/h3`

const app = new H3()

app.get('/', event => {
  const locale = getHeaderLocale(event.req)
  return locale.toString()
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
