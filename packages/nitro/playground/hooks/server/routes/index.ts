import { defineHandler } from 'nitro'
import { useTranslation } from '../../../../src/index.ts' // `@intlify/nitro`

export default defineHandler(async event => {
  const t = await useTranslation(event)
  return t('hello', { name: 'Nitro' })
})
