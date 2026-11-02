import { definePlugin } from 'nitro'
import { useTranslation } from '../../../../src/index.ts' // `@intlify/nitro`

import type { H3Event } from 'nitro/h3'

// Nitro registers the plugins in the order of their paths, so this one comes before `i18n.ts`
export default definePlugin(nitroApp => {
  nitroApp.hooks.hook('request', async event => {
    const t = await useTranslation(event)
    // Nitro passes an `H3Event` to the `request` hooks
    ;(event as H3Event).res.headers.set(
      'x-early-greeting',
      encodeURIComponent(t('hello', { name: 'Nitro' }))
    )
  })
})
