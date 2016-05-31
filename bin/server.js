'use strict'

const server = require('../src/server')
const config = require('../src/config')


server.listen(config.port, server => {
  console.log(`Server started at ${config.port}`)
})
