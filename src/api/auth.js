const API_URL = 'https://quiz.animesongs.org/api/auth'

const authorize = params => fetch(API_URL, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: params.username,
    password: params.password
  })
}).then(r => r.ok ? r.json() : false)

export { authorize }
