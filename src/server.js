'use strict'

const express = require('express')

const config = require('./config')

const server = express({
    name: config.name 
})

server.use(express.static(`${__dirname}/public`))
server.use(express.static(`${__dirname}/../static`))

server.use('*', (req, res, next) => {
  res.status(200).send('Rolea!')
})




module.exports = server
