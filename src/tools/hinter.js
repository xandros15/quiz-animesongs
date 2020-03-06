import Bloodhound from 'bloodhound-js'

const titlesUrl = '/anime-titles.xml'

let titles = []
let uniq = []

const titleTranslator = title => {
  if (title.indexOf('`') !== -1) {
    title = title.replace(/`/g, '\'')//translate grave accent to apostrophe
  }
  if (title.indexOf(' (') !== -1) {
    title = title.replace(/\s\([\w\s]+\)$/g, '')//remove last bracket info of ver anime
  }
  return title
}

const addTitle = (id, title) => {
  const index = uniq.indexOf(title.toLowerCase())
  if (index === -1) {
    titles.push({ids: [id], title})
    uniq.push(title.toLowerCase())
  } else if (titles[index].ids.indexOf(id) === -1) {
    titles[index].ids.push(id)
  }
}

const addAltTitle = (id, title) => {
  if (title.indexOf('-iro') !== -1) {
    title = title.replace(/-(iro(?:\s|$))/g, '$1')//this is a case for -iro
    addTitle(id, title)
  }
}

const getTitles = langs => {
  return fetch(titlesUrl)
    .then(
      response => response.text()
    )
    .then(
      str => (new window.DOMParser()).parseFromString(str, 'text/xml')
    )
    .then(
      async data => {
        titles = []
        uniq = []
        data.querySelectorAll('anime').forEach(anime => {
          const id = parseInt(anime.getAttribute('aid'))
          anime.querySelectorAll('title').forEach(title => {
            let content = titleTranslator(title.textContent)
            const lang = title.getAttribute('xml:lang')
            const type = title.getAttribute('type')
            if (type === 'main' || (type === 'official' && langs.indexOf(lang) !== -1)) {
              addTitle(id, content)
              addAltTitle(id, content)
            }
          })
        })
        return titles
      }
    )
}

const hinter = new Bloodhound({
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title')
})
let isInitialized = false

export const loadHinter = async langs => {
  hinter.clear()
  const titles = await getTitles(langs)
  hinter.add(titles)
  await hinter.initialize()
  isInitialized = true

  return hinter
}

export const search = (guess, callback) => {
  if (hinter) {
    hinter.search(guess, callback)
  } else {
    callback([])
  }
}

export const isHinterLoaded = () => {
  return isInitialized
}
