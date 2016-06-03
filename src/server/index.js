'use strict'

const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser   = require('body-parser')
const session      = require('express-session')
const morgan = require('morgan')

const config = require('../config')

const app = express({
    name: config.name
})

app.use(morgan('dev'))
app.use(cookieParser()) // read cookies (needed for auth)
app.use(bodyParser.json()) // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'roleandovoy' }))

// add every route here
require('./passport/index')(app)
require('./api/index')(app)

app.use(express.static(`${__dirname}/public`))
app.use('/static', express.static(`${__dirname}/../../static`))

app.set('view engine', 'ejs') // set up ejs for templating

app.use('/', (req, res) => {
  res.send('Rolear es bien')
})
app.use('*', (req, res) => {
  console.log(`UNKNOWN URL ${req.originalUrl}`)
  res.redirect(301, '/')
})

module.exports = app
