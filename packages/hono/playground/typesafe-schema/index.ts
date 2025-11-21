// in your project, `import { ... } from '@inlify/hono'`
import { Hono } from 'hono'
import { defineIntlifyMiddleware } from '../../src/index.ts'

// define resource schema
type ResourceSchema = {
  hello: string
}

// you can specify resource schema and locales to type parameter.
// - first type parameter: resource schema
// - second type parameter: locales
const intlify = defineIntlifyMiddleware<[ResourceSchema], 'en' | 'ja'>({
  messages: {
    en: { hello: 'Hello, {name}' },
    // you can see the type error, when you will comment out the below `ja` resource
    ja: { hello: 'こんにちは、{name}' }
  }
  // something options
  // ...
})

const app: Hono = new Hono()
app.use('*', intlify)
// something your implementation code ...
// ...

export default app
