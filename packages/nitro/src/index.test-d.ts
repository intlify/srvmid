import { expectTypeOf, test } from 'vitest'
import { intlify, useTranslation } from './index.ts'

import type { HTTPEvent } from 'nitro/h3'

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

test('intlify plugin', () => {
  const _en = {
    hello: 'worked'
  }
  type ResourceSchema = typeof _en
  intlify<[ResourceSchema], 'en' | 'ja'>({
    messages: {
      en: { hello: 'world' },
      ja: { hello: '世界' }
    }
  })
})

test('translation function', async () => {
  const eventMock = {
    context: {}
  } as unknown as HTTPEvent

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
