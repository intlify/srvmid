[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / getPathLocale

# Function: getPathLocale()

```ts
function getPathLocale(context, __namedParameters?): Locale;
```

get the locale from the path

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `Context` | A Context \| Hono context |
| `__namedParameters?` | `PathOptions` | - |

## Returns

`Locale`

The locale that resolved from path

## Throws

Throws the RangeError if the language in the path, that is not a well-formed BCP 47 language tag.
