'use strict'

const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const morgan = require('morgan')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)

const config = require('../config')
const requireUserByToken = require('./middlewares/require_user_by_token')

mongoose.connect(config.database.url)

const app = express({
  name: config.name
})

app.use(morgan('dev'))
app.use(cookieParser()) // read cookies (needed for auth)
app.use(bodyParser.json()) // get information from html forms
app.use(bodyParser.urlencoded({extended: true}))

// Basic usage
// mongoose.connect(config.database.url)

app.use(session({
  secret: config.auth.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: config.auth.sessionCookieExpiration},
  store: new MongoStore({mongooseConnection: mongoose.connection})
}))

app.use((err, req, res, next) => {
  console.log('err', err)
  res.send(err)
})

app.use(requireUserByToken())

// add every route here
require('./passport/index')(app)
require('./api/index')(app)

app.use(express.static(`${__dirname}/public`))
app.use('/static', express.static(`${__dirname}/../../static`))

app.set('view engine', 'ejs') // set up ejs for templating

app.get('/', (req, res) => {
  res.send('Rolear es bien')
})

module.exports = app
