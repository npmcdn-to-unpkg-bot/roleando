'use strict'

const requiresToken = require('../../middlewares/require_token')

module.exports = app => {

  app.get('/api/me', requiresToken, (req, res) => {

    res.send({
      user: req.user.name,
      picture: req.user.google.picture
    })

  })
}