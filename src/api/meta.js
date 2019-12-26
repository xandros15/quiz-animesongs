const apiMeta = 'https://animesongs.org/api/songs'

const getMeta = id => {
  return fetch(apiMeta + '/' + id).then(r => r.json())
}
const searchSongs = (search) => {
  return fetch(apiMeta + '?search=' + search).then(r => r.json())
}
const request = url => {
  return fetch(url).then(r => r.json())
}

export default {
  request,
  getMeta,
  searchSongs
}
