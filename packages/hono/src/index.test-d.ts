import { expectTypeOf, test } from 'vitest'
import { defineIntlifyMiddleware } from './index.ts'

import type { MiddlewareHandler } from 'hono'

test('defineIntlifyMiddleware', () => {
  const _en = {
    hello: 'worked'
  }
  // @ts-expect-error -- FIXME
  type ResourceSchema = typeof _en // eslint-disable-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars -- NOTE: for type testing
  const intlify = defineIntlifyMiddleware({
    messages: {
      en: { hello: 'world' },
      ja: { hello: '世界' }
    }
  })

  expectTypeOf<MiddlewareHandler>(intlify).toExtend<MiddlewareHandler>()
})
