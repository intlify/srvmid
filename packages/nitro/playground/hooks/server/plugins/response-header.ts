import { definePlugin } from 'nitro'
import { useTranslation } from '../../../../src/index.ts' // `@intlify/nitro`

// Nitro registers the plugins in the order of their paths, so this one comes after `i18n.ts`
export default definePlugin(nitroApp => {
  nitroApp.hooks.hook('response', async (response, event) => {
    const t = await useTranslation(event)
    response.headers.set('x-greeting', encodeURIComponent(t('hello', { name: 'Nitro' })))
  })
})
