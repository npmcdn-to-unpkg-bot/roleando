'use strict'

const errors = require('restify-errors')

const requiresLogin = require('../middlewares/require_login')
const requiresToken = require('../middlewares/require_token')

module.exports = (app, passport) => {

  app.get('/auth/token', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next(new errors.UnauthorizedError('User not authenticated'))
    }

    if (!req.user || !req.user.hasValidToken()) {
      return next(new errors.UnauthorizedError('Invalid token'))
    }

    res.send({
      token: req.user.token
    })
  })

  app.put('/auth/token', requiresLogin, requiresToken, (req, res, next) => {

    req.user.refreshToken()

    req.user.save().then(user => {
      res.send({ token: user.token })
    }).catch(next)

  })

  // send to google to do the authentication
  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }))

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect : '/',
      failureRedirect : '/'
    }))

  // send to google to do the authentication
  app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }))

  // the callback after google has authorized the user
  app.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect : '/',
      failureRedirect : '/'
    }))

  app.get('/unlink/google', requiresLogin, function(req, res) {
    var user          = req.user
    user.google.token = undefined
    user.save(function(err) {
      req.logout()
      res.redirect('/')
    })
  })

}
