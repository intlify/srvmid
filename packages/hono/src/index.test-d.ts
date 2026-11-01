import { expectTypeOf, test } from 'vite-plus/test'
import { defineIntlifyMiddleware } from './index.ts'

import type { MiddlewareHandler } from 'hono'

test('defineIntlifyMiddleware', () => {
  const _en = {
    hello: 'worked'
  }
  type ResourceSchema = typeof _en
  const intlify = defineIntlifyMiddleware<[ResourceSchema], 'en' | 'ja'>({
    messages: {
      en: { hello: 'world' },
      ja: { hello: '世界' }
    }
  })

  expectTypeOf<MiddlewareHandler>(intlify).toExtend<MiddlewareHandler>()
})
