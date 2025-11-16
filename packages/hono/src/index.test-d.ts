import { expectTypeOf, test } from 'vitest'
import { defineI18nMiddleware } from './index.ts'

import type { MiddlewareHandler } from 'hono'

test('defineI18nMiddleware', () => {
  const _en = {
    hello: 'worked'
  }
  // @ts-expect-error -- FIXME
  type ResourceSchema = typeof _en // eslint-disable-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars -- NOTE: for type testing
  const middleware = defineI18nMiddleware({
    messages: {
      en: { hello: 'world' },
      ja: { hello: '世界' }
    }
  })

  expectTypeOf<MiddlewareHandler>(middleware).toExtend<MiddlewareHandler>()
})
