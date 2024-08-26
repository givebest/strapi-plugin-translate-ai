'use strict'

const { AiTranslator } = require('./ai')
const Bottleneck = require('bottleneck/es5')

const {
  AI_PRIORITY_DEFAULT,
  AI_API_MAX_TEXTS,
  AI_API_ROUGH_MAX_REQUEST_SIZE,
} = require('./constants')
const { getService } = require('./get-service')

/**
 * Module dependencies
 */

module.exports = {
  provider: 'ai',
  name: 'AI',

  init(providerOptions = {}) {
    const apiKey = providerOptions.apiKey
    const apiUrl = providerOptions.apiUrl
    const apiModel = providerOptions.apiModel
    const apiOptions =
      typeof providerOptions.apiOptions === 'object' ? providerOptions.apiOptions : {}

    const client = new AiTranslator({ apiKey, apiUrl, apiModel })

    const limiter = new Bottleneck({
      minTime: process.env.NODE_ENV == 'test' ? 10 : 200,
      maxConcurrent: 5,
    })

    const rateLimitedTranslate = limiter.wrap(client.translate.bind(client))

    return {
      /**
       * @param {{
       *  text:string|string[],
       *  sourceLocale: string,
       *  targetLocale: string,
       *  priority: number,
       *  format?: 'plain'|'markdown'|'html'
       * }} options all translate options
       * @returns {string[]} the input text(s) translated
       */
      async translate({ text, priority, sourceLocale, targetLocale, format }) {
        if (!text) {
          return []
        }
        if (!sourceLocale || !targetLocale) {
          throw new Error('source and target locale must be defined')
        }

        const chunksService = getService('chunks')
        const formatService = getService('format')

        const tagHandling = format === 'plain' ? undefined : 'html'

        let textArray = Array.isArray(text) ? text : [text]

        if (format === 'markdown') {
          textArray = formatService.markdownToHtml(textArray)
        }

        const { chunks, reduceFunction } = chunksService.split(textArray, {
          maxLength: AI_API_MAX_TEXTS,
          maxByteSize: AI_API_ROUGH_MAX_REQUEST_SIZE,
        })

        const result = reduceFunction(
          await Promise.all(
            chunks.map(async (texts) => {
              let result
              try {
                result = await rateLimitedTranslate.withOptions(
                  {
                    priority: typeof priority == 'number' ? priority : AI_PRIORITY_DEFAULT,
                  },
                  {
                    texts,
                    sourceLocale: sourceLocale,
                    targetLocale: targetLocale,
                    ...apiOptions,
                    tagHandling,
                  },
                )
              } catch (error) {
                console.log('🚀 ~ chunks.map ~ error:', error)
              }
              return result.map((value) => value)
            }),
          ),
        )

        if (format === 'markdown') {
          return formatService.htmlToMarkdown(result)
        }

        return result
      },
      async usage() {
        return (await client.getUsage()).character
      },
    }
  },
}
