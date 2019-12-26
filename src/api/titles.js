import Bloodhound from 'bloodhound-js'

const titlesUrl = '/anime-titles.xml'

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
        const titles = []
        const uniq = []
        data.querySelectorAll('anime').forEach(anime => {
          const id = anime.getAttribute('aid')
          anime.querySelectorAll('title').forEach(title => {
            const content = title.textContent.replace(/`/g, '\'')
            const lang = title.getAttribute('xml:lang')
            const type = title.getAttribute('type')
            if (type === 'main' || (type === 'official' && langs.indexOf(lang) !== -1)) {
              if (uniq.indexOf(content.toLowerCase()) === -1) {
                titles.push({id, title: content})
                uniq.push(content.toLowerCase())
              }
            }
          })
        })
        const engine = new Bloodhound({
          local: titles,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title')
        })
        await engine.initialize()

        return engine
      }
    )
}

export { getTitles }



