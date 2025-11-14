[**@intlify/hono**](../index.md)

***

[@intlify/hono](../index.md) / getQueryLocale

# Function: getQueryLocale()

```ts
function getQueryLocale(context, __namedParameters?): Locale;
```

get the locale from the query

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `Context` | A Context \| Hono context |
| `__namedParameters?` | `QueryOptions` | - |

## Returns

`Locale`

The locale that resolved from query

## Throws

Throws the RangeError if the language in the query, that is not a well-formed BCP 47 language tag.
