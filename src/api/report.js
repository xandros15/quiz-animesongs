const API_URL = 'https://quiz.animesongs.org/api/songs/report'

const addReport = id => {
  return fetch(API_URL + '/' + id, {method: 'POST'})
}

const removeReport = ({id, auth}) => {
  const opt = {
    headers: {}
  }
  if (auth) {
    opt.headers['Authorization'] = auth
  }

  return fetch(API_URL + '/' + id, {method: 'DELETE'})
}

const getReports = ({auth}) => {
  const opt = {
    headers: {}
  }
  if (auth) {
    opt.headers['Authorization'] = auth
  }

  return fetch(API_URL, opt).then(r => r.ok ? r.json() : {reports: []})
}

export default {
  addReport,
  removeReport,
  getReports
}
