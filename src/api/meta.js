const apiMeta = 'https://animesongs.org/api/songs'

const getMeta = id => {
  return fetch(apiMeta + '/' + id).then(r => r.json())
}

const getMetas = ids => {
  return fetch(apiMeta + '/list', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({'ids': ids})
  }).then(r => r.ok ? r.json() : []).catch(() => [])
}

const getSongs = async ids => {
  let total = []
  for (let a = 0; a < ids.length; a += 100) {
    const {songs} = await getMetas(ids.slice(a, a + 100))
    total = total.concat(songs || [])
  }
  return total
}

const searchSongs = (search) => {
  return fetch(apiMeta + '?search=' + encodeURIComponent(search)).then(r => r.json())
}
const request = url => {
  return fetch(url).then(r => r.json())
}

export default {
  request,
  getMeta,
  getMetas,
  getSongs,
  searchSongs
}
