[**@intlify/h3**](../index.md)

***

[@intlify/h3](../index.md) / IntlifyMiddleware

# Interface: IntlifyMiddleware

Internationalization middleware for H3

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-onrequest"></a> `onRequest` | `Middleware` | Request middleware which is defined with [`onRequest`](https://h3.dev/utils/more#onrequesthook) |
| <a id="property-onresponse"></a> ~~`onResponse`~~ | `Middleware` | Response middleware which is defined with [`onResponse`](https://h3.dev/utils/more#onresponsehook) **Deprecated** This middleware does nothing, because the event context lives only for the request. Register `onRequest` only. It will be removed in the next major version. |
