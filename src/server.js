'use strict'

const express = require('express')
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const morgan = require('morgan')

const config = require('./config')

const app = express({
    name: config.name
})

app.use(morgan('dev'))
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'roleandovoy' }))

const addPassport = require('./passport');
addPassport(app)

app.use(express.static(`${__dirname}/public`))
app.use(express.static(`${__dirname}/../static`))

app.set('view engine', 'ejs'); // set up ejs for templating

app.use('*', (req, res, next) => {
  res.status(200).send('Rolea!')
})

module.exports = app
