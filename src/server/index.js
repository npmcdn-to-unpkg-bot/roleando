'use strict'

const express = require('express')
const errors = require('restify-errors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const morgan = require('morgan')
const mongoose = require('mongoose')
const nunjucks = require( 'nunjucks' )
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
  name: 'roleando.heroku',
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
require('./passport')(app)
require('./api')(app)
require('./public')(app)
require('./sitemap')(app)

app.use(express.static(`${__dirname}/../../static`))

//app.set('view engine', 'ejs') // set up ejs for templating
nunjucks.configure( `${__dirname}/views`, {
  autoescape: true,
  cache: false,
  express: app
} )
app.engine( 'html', nunjucks.render )
app.set( 'view engine', 'html' ) ;
app.use(function(err, req, res, next) {


  if (req.header('content-type') === 'application/json') {
    if (err instanceof errors.HttpError) {
      res.status(err.statusCode).send(err.body)
      return
    } else {
      console.log(err.stack)
      res.status(500).send(new errors.InternalServerError(err).body)
      return
    }
  }
  console.log(err.stack)
  res.status(500).send(err.message || 'Something broke!')

})

module.exports = app
