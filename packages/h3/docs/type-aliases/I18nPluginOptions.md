[**@intlify/h3**](../index.md)

***

[@intlify/h3](../index.md) / I18nPluginOptions

# Type Alias: I18nPluginOptions\<Schema, Locales, Message\>

```ts
type I18nPluginOptions<Schema, Locales, Message> = CoreOptions<Message, SchemaParams<Schema, Message>, LocaleParams<Locales>>;
```

Internationalization plugin options for H3

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `Schema` | `DefaultLocaleMessageSchema` | Locale message schema type, default is `DefaultLocaleMessageSchema` |
| `Locales` | `string` | Locale type, default is `string` |
| `Message` | `string` | Message type, default is `string` |
