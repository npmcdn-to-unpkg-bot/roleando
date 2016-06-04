'use strict'

const passport = require('passport')

const config = require('../../config')
const isLoggedIn = require('../middlewares/require_login')

require('./config')(passport) // pass passport for configuration

module.exports = app => {

  // required for passport
  app.use(passport.initialize())
  app.use(passport.session()) // persistent login sessions

  require('./routes.js')(app, passport)

  // show the home page (will also have our login links)
  app.get('/user/login', function(req, res) {
    res.render('index.ejs')
  })

  app.get('/user/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user : req.user
    })
  })

  app.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/user/login')
  })
}
