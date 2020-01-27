const availableLanguages = [
  {
    label: 'None',
    alias: false,
  },
  {
    label: 'German',
    alias: 'de',
  },
  {
    label: 'Polish',
    alias: 'pl',
  },
  {
    label: 'Spanish',
    alias: 'es',
  },
  {
    label: 'Italian',
    alias: 'it',
  },
]

export const getDefaultLanguage = () => {
  if (navigator.language) {
    let lang = navigator.language.split('-')[0]
    if (availableLanguages.find(i => i.alias === lang)) {
      return lang
    }
  }
  return availableLanguages[0].alias
}

export const getLabeledLanguages = () => {
  let languages = {}
  for (const lang of availableLanguages) {
    languages[lang.label] = lang.alias
  }
  return languages
}
