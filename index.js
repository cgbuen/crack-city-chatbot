const fs = require('fs')
const moment = require('moment')
const express = require('express')
const open = require('open')
const { COUNTER, TOKEN_STORE } = require('./vars')

const app = express()
const port = 3000

// create stats file & token store directory (if they don't exist)
!fs.existsSync(`./${COUNTER}.json`) && fs.writeFileSync(`./${COUNTER}.json`, '{}')
!fs.existsSync(`./${TOKEN_STORE}`) && fs.mkdirSync(`./${TOKEN_STORE}`)

const startTime = moment()

const initSpotify = require('./endpoints/init-spotify')
const initTwitch = require('./endpoints/init-twitch')
app.get('/inittoken-spotify', initSpotify.init)
app.get('/inittoken-twitch', initTwitch.init)
app.get('/callback-spotify', initSpotify.callback)
app.get('/callback-twitch', initTwitch.callback)
app.get('/spotify.json', require('./endpoints/json-spotify'))
app.get('/twitch.json', require('./endpoints/json-twitch'))
app.get('/internal-stats.json', require('./endpoints/json-internal-stats')( { startTime }))
app.get('/splatoon.json', require('./endpoints/json-splatoon'))
app.get('/chat', require('./endpoints/chat')({ startTime }))
app.get('/pubsub', require('./endpoints/pubsub'))

app.listen(port, () => console.log(`Spotify callback API endpoint app listening on port ${port}.`))
open(`${'http://localhost:3000'}${fs.existsSync(`./${TOKEN_STORE}/twitch-access`) ? '/chat' : '/inittoken-twitch'}`)
open(`${'http://localhost:3000'}/pubsub`)
