import { shuffle, slice } from 'lodash'
import metaApi from './meta'

const apiQuiz = process.env.NODE_ENV === 'development' ? 'http://localhost/songs' : 'https://quiz.animesongs.org/api/songs'

const getSongs = ({settings}) => {
  const encode = encodeURIComponent
  const params = {
    types: settings.types,
    yearMax: settings.yearMax,
    yearMin: settings.yearMin,
    difficulty: settings.difficulty || 'all',
  }

  const parsedParams = Object.keys(params).map(k => {
    if (Array.isArray(params[k])) {
      return params[k].map(i => `${encode(k)}[]=${encode(i)}`).join('&')
    } else {
      return `${encode(k)}=${encode(params[k])}`
    }
  }).join('&')

  return fetch(apiQuiz + '?' + parsedParams)
    .then(response => response.json())
    .then(async ({songs}) => {
      const newSongs = []
      const metas = await metaApi.getSongs(songs.map(i => i.id))
      for (const song of songs) {
        const newSong = metas.find(({id}) => id === song.id)
        newSong.sample = songToUrl({song, sample: settings.sample})
        newSong.sound = new Audio()
        newSongs.push(newSong)
      }
      return newSongs
    })
}

const getSongsFromLocal = async ({list, settings}) => {
  list = shuffle(list)
  list = slice(list, 0, 50)
  let songs = []
  const existSongs = await existsMultiple(list)
  const metas = await metaApi.getSongs(list)
  for (const song of existSongs) {
    const {sample} = song
    if (sample && (sample.start || sample.middle || sample.end)) {
      const newSong = metas.find(({id}) => id === song.id)
      newSong.sample = songToUrl({song, sample: settings.sample})
      newSong.sound = new Audio()
      songs.push(newSong)
    }
  }
  songs = shuffle(songs)
  return songs
}

const upload = ({file, threshold, auth}) => {
  const opt = {
    method: 'PUT',
    headers: {
      'Content-Type': 'audio/mpeg',
    },
    body: file
  }
  if (auth) {
    opt.headers['Authorization'] = auth
  }

  return fetch(apiQuiz + '/add?threshold=' + encodeURIComponent(threshold), opt)
}

const existsMultiple = ids => {
  return fetch(apiQuiz + '/has', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({'ids': ids})
  }).then(r => r.ok ? r.json() : []).catch(() => [])
}

const exists = id => {
  return fetch(apiQuiz + '/has/' + id).then(r => r.ok ? r.json() : {})
}

const answer = (id, correct) => {
  return fetch(apiQuiz + '/answer/' + id, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({'correct': correct})
  }).then(r => r.ok)
}

function songToUrl ({song, sample}) {
  if (sample === 'random' || !song.sample[sample]) {
    const samples = []
    for (const [key, value] of Object.entries(song.sample)) {
      if (value === true) {
        samples.push(key)
      }
    }

    sample = samples[Math.floor(Math.random() * samples.length)]
  }

  return `https://songs.animesongs.org/${sample}-sample-${song.id}.mp3`
}

export {
  getSongsFromLocal,
  getSongs,
  existsMultiple,
  exists,
  upload,
  answer,
}
