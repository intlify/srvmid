[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / getDetectorLocale

# Function: getDetectorLocale()

```ts
function getDetectorLocale(c): Promise<Locale>;
```

get a locale which is detected with locale detector.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `c` | `Context` | A Hono context |

## Returns

`Promise`\<`Locale`\>

Return an `Intl.Locale` instance representing the detected locale

## Description

The locale obtainable via this function comes from the locale detector specified in the `locale` option of the [defineIntlifyMiddleware](defineIntlifyMiddleware.md).

## Example

```js
app.get(
  '/',
  async c => {
    const locale = await getDetectorLocale(c)
    return c.text(`Current Locale: ${locale.language}`)
  },
)
```
