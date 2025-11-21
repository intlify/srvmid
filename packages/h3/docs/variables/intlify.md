[**@intlify/h3**](../index.md)

***

[@intlify/h3](../index.md) / intlify

# Variable: intlify()

```ts
const intlify: (options) => H3Plugin;
```

Internationalization plugin for H3

## Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`IntlifyPluginOptions`](../type-aliases/IntlifyPluginOptions.md) |

## Returns

`H3Plugin`

## Example

```ts
import { H3 } from 'h3'
import { intlify } from '@intlify/h3'

const app = new H3({
  plugins: [
    intlify({
      messages: {
        en: {
          hello: 'Hello {name}!',
        },
        ja: {
          hello: 'こんにちは、{name}！',
        },
      },
      // your locale detection logic here
      locale: (event) => {
        // ...
      },
    })
  ]
})
