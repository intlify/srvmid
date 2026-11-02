import { defineHandler } from 'nitro'
import { useTranslation } from '../../../../src/index.ts' // `@intlify/nitro`

export default defineHandler(async event => {
  const t = await useTranslation(event)
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      // translate after the handler returns, while the body is streamed
      await new Promise(resolve => setTimeout(resolve, 10))
      controller.enqueue(new TextEncoder().encode(t('hello', { name: 'Nitro' })))
      controller.close()
    }
  })
})
