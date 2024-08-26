const translatePrompt = ({ texts, sourceLocale, targetLocale }) => {
  const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

  return `Please translate the value of the following JSON content from ${languageNames.of(
    sourceLocale,
  )} to ${languageNames.of(targetLocale)},  and keep the original JSON format.

${texts}
`
}

module.exports = {
  translatePrompt,
}
