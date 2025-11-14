// in your project, `import { ... } from '@inlify/h3'`
import { createApp } from 'h3'
import { defineI18nMiddleware } from '../../src/index.ts'

// define resource schema
type ResourceSchema = {
  hello: string
}

// you can specify resource schema and locales to type parameter.
// - first type parameter: resource schema
// - second type parameter: locales
const middleware = defineI18nMiddleware<[ResourceSchema], 'en' | 'ja'>({
  messages: {
    en: { hello: 'Hello, {name}' },
    // you can see the type error, when you will comment out the below `ja` resource
    ja: { hello: 'こんにちは、{name}' }
  }
  // something options
  // ...
})

// @ts-expect-error -- FIXME
const app = createApp({ ...middleware })
// something your implementation code ...
// ...
