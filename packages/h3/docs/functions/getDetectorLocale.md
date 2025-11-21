[**@intlify/h3**](../index.md)

***

[@intlify/h3](../index.md) / getDetectorLocale

# Function: getDetectorLocale()

```ts
function getDetectorLocale(event): Promise<Locale>;
```

get a locale which is detected with locale detector.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `H3Event` | A H3 event |

## Returns

`Promise`\<`Locale`\>

Return an `Intl.Locale` instance representing the detected locale

## Description

The locale obtainable via this function comes from the locale detector specified in the `locale` option of the [intlify](../variables/intlify.md) plugin.

## Example

```js
app.get(
  '/',
  async (event) => {
    const locale = await getDetectorLocale(event)
    return `Current Locale: ${locale.language}`
  },
)
```
