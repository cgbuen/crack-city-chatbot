# Twitch Chatbot / Endpoint Server

My locally-running Twitch chatbot for some simple commands, including game ID
display, currently-playing Spotify song, shoutouts with real-user checking, and
a fun leaderboard chat game. It also logs the chat.

This runs on port 3000.

This also has evolved into a means by which to serve API endpoints, since much
of the data needed for the chatbot to respond with can be reused into Express
responses that can be consumed by _another_ locally running server for a web
application. This, for example, could be useful for a broadcast overlay.
([Here](https://github.com/cgbuen/ticker) is the corresponding one that I use.)

The endpoints gather data from the following sources:

- Spotify API (for currently playing song)
- Twitch API (for followers, bits, and subs)
- Splatoon API (for gear, ranks, and other stats)
- Animal Crossing: New Horizons API (for player/island info, as well as live
  keyboard inputs)
- [s2s / flapg](https://github.com/frozenpandaman/splatnet2statink/wiki/api-docs)
  APIs (for refreshing Nintendo tokens)
- Your own local machine (for chat game stats, uptime, and other possible
  hardcoded data)

## Before Installing: Register Developer Apps

One benefit of this project is that it allows you to not have to depend on your
own machine's Spotify desktop client application when looking for the song
that's currently being played, but instead Spotify's API data that they have on
you, as you're playing music.

Note that Spotify's API requires OAuth 2.0 to get any user data, which makes for
a somewhat complicated authentication process (it in fact requires the use of an
actual Spotify developer app). The directions here allow you to quickly stand up
your own app (it does not have to be published), so that you're authenticating
to what you've made yourself, rather than someone else's live developer app.

Similar functionality has been added for the new Twitch API, which also uses
OAuth 2.0. The purpose here is solely for spitting out tokens for gathering the
followers / bits / subs data.

1. Register as a [Spotify Developer](https://developer.spotify.com/dashboard/login).
2. Create a project by clicking the "Create a Client ID" and filling out all
   the appropriate fields.
3. Go to "Edit Settings" and add `http://localhost:3000/callback-spotify` to the
   whitelist of Redirect URIs.
4. Make note of the app's associated Client ID and Client Secret. These get
   used when configuring this bot later (see the Configure section).
5. Repeat steps 1-4, but for [Twitch](https://dev.twitch.tv/login).

## Install

I'm using node 8.16.0 and npm 5.10.0, but this is probably simple enough to work
with a lot of different versions.

    npm ci

## Configure

Add a vars.js here (which is .gitignore'd) in the root directory, with the
following format:

    module.exports = {
      BOT_USER: '[your bot's twitch handle]',
      CHANNEL: '[your channel]',
      GAME_ID: '[your gaming id of choice]',
      SPOTIFY_CLIENT_ID: '[your spotify app's client_id]',
      SPOTIFY_CLIENT_SECRET: '[your spotify app's client_secret]',
      TWITCH_CLIENT_ID: '[your twitch app's client_id]',
      TWITCH_CLIENT_SECRET: '[your twitch app's client_secret]',
      NINTENDO_SESSION: '[your Nintendo `session_token`]',
      DISCORD: '[link to your discord server]',
      COUNTER: '[extension-less filename for local JSON counter file]',
      TOKEN_STORE: '[local directory where tokens are stored]'
    }

### Notes

- `BOT_USER` can be the same handle you use for your channel (`CHANNEL`).
- `GAME_ID` example: Nintendo Switch Friend Code.
- The default `COUNTER` (i.e. what's in _.gitignore_) should be "stats".
- Write your `TOKEN_STORE` value into a new line in _.gitignore_. The default
  (i.e. what's in _.gitignore_) should be "token-store".
- `NINTENDO_SESSION` is the `session_token` that must be retrieved using an MitM
  proxy (e.g. Charles) into your personal device's Nintendo Switch app. Note
  that this goes here as your "configurable" variable rather than being placed
  in `TOKEN_STORE`, since `TOKEN_STORE` is only meant for tokens/data that are
  generated by the use of this software.

## Run

    npm start

This kicks off a few things:

- The Express endpoint server, most notable for the API data that gets consumed
  by a separate React app
- A sockets connection to Twitch chat (twitch-js), as per one of the endpoints
  which is opened in your browser, which then redirects to your main Twitch
  stream dashboard page
- A separate sockets connection to Twitch for channel points redemptions
  (written from scratch here), as per one of the endpoints which is opened in
  your browser, which then redirects to your Twitch channel's rewards settings
  page

### Notes

You'll have to hit the following endpoints if you're running this the
first time. These retrieve your proper access and refresh tokens and store them
into your `TOKEN_STORE` directory.

- [Twitch token initialization](http://localhost:3000/init-twitch) (auto-opens on first load)
- [Spotify token initialization](http://localhost:3000/init-spotify)
- [Nintendo token initialization](http://localhost:3000/init-nintendo)

Note that there is user-specific data that is generated upon use of this
software, which end up getting stored in `TOKEN_STORE` despite not being tokens
per se. They just need to be stored somewhere safe, and they might as well be
considered sensitive anyway.
