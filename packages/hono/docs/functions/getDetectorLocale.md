[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / getDetectorLocale

# Function: getDetectorLocale()

```ts
function getDetectorLocale(ctx): Promise<Locale>;
```

get a locale which is detected with locale detector.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ctx` | `Context` | A Hono context |

## Returns

`Promise`\<`Locale`\>

Return a Intl.Locale \| locale

## Description

The locale obtainable via this function comes from the locale detector specified in the `locale` option of the [defineI18nMiddleware](defineI18nMiddleware.md).

## Example

```js
app.get(
  '/',
  async ctx => {
    const locale = await getDetectorLocale(ctx)
    return ctx.text(`Current Locale: ${locale.language}`)
  },
)
```
