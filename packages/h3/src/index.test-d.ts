import { expectTypeOf, test } from 'vitest'
import { defineIntlifyMiddleware, useTranslation } from './index.ts'

import type { H3Event } from 'h3'

/**
 * you can define global resource schema extending with `declare module`
 */
declare module './index.ts' {
  /**
   * Define your locale message schema here
   */
  export interface DefineLocaleMessage {
    /**
     * Define your locale message schema here
     */
    test: string
  }
}

test('defineIntlifyMiddleware', () => {
  const _en = {
    hello: 'worked'
  }
  type ResourceSchema = typeof _en
  defineIntlifyMiddleware<[ResourceSchema], 'en' | 'ja'>({
    messages: {
      en: { hello: 'world' },
      ja: { hello: '世界' }
    }
  })
})

test('translation function', async () => {
  const eventMock = {
    context: {}
    // TODO: temporary workaround to unblock the release workflow refactor PR.
    // `H3Event` became a `declare class` with many required properties in h3 v2,
    // so partial mocks need an `unknown` cast. Replace with a proper mock
    // factory in a follow-up PR.
  } as unknown as H3Event

  const _resources = {
    foo: 'foo',
    bar: {
      buz: {
        baz: 'baz'
      }
    }
  }

  const t = await useTranslation<typeof _resources>(eventMock)
  expectTypeOf<string>(t('test')).toExtend<string>()
  expectTypeOf<string>(t('foo')).toExtend<string>()
  expectTypeOf<string>(t('bar.buz.baz')).toExtend<string>()
})
