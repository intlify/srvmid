import { H3 } from 'h3'
import { serve } from 'srvx'
import {
  detectLocaleFromAcceptLanguageHeader,
  plugin as i18n,
  useTranslation
} from '../../src/index.ts' // in your project, `import { ... } from '@inlify/h3'`

import en from './locales/en.ts'
import ja from './locales/ja.ts'

// 'en' resource is master schema
type ResourceSchema = typeof en

// you can put the type extending with `declare module` as global resource schema
declare module '../../src/index.ts' {
  // please use `declare module '@intlifly/h3'`, if you want to use global resource schema in your project.
  export interface DefineLocaleMessage extends ResourceSchema {}
}

const app = new H3({
  plugins: [
    i18n({
      locale: detectLocaleFromAcceptLanguageHeader,
      messages: {
        en,
        ja
      }
    })
  ]
})

app.get('/', async event => {
  const t = await useTranslation(event)
  return t('hello', { name: 'h3' })
})

const server = serve({
  port: 3000,
  fetch: app.fetch
})

await server.ready()
