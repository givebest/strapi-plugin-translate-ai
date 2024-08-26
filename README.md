# AI provider for Strapi Translate Plugin

Configure the provider through the pluginOptions:

```js
module.exports = {
  // ...
  translate: {
    enabled: true,
    config: {
      provider: 'ai',
      providerOptions: {
        apiKey: 'sk-**-**`',
        // use custom api url - optional
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiModel: 'gpt-4o-mini',
      },
      // other options ...
    },
  },
  // ...
}
```

or use the default environment variables:

- `AI_API_KEY` - default `undefined`
- `AI_API_URL` - default `https://api.openai.com/v1/chat/completions`
- `AI_API_MODEL` - default `gpt-4o-mini`

To get an API key, register for [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys), Or use the OpenAI-compatible `apiUrl` and `apiKey`.
