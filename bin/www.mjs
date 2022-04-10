#!/usr/bin/env node

import app from '../app.mjs'
import http from 'http'

const httpServer = http.createServer()
const port = 2999

  ; (async () => {
    app.set('port', port)
    httpServer.on('request', app)
    httpServer.listen(port)
    httpServer.on('listening', () => {
      console.log(`Listening on http://localhost:${port}`)
    })
  })()
