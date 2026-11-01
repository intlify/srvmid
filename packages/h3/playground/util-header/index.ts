import { H3 } from 'h3'
import { serve } from 'srvx'
import { getHeaderLocale } from '../../src/index.ts' // `@intlify/h3`

const app = new H3()

app.get('/', event => {
  const locale = getHeaderLocale(event.req)
  return locale.toString()
})

const server = serve({
  fetch: app.fetch
})

await server.ready()
