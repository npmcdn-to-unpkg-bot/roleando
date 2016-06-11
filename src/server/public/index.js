'use strict'

const config = require('../../config')

const addGeneratorsRoutes = require('./generadores')

module.exports = app => {

  addGeneratorsRoutes(app)
  app.get('/blog', (req, res) => res.redirect(config.blogUrl))

  app.get('/', (req, res) => {
    res.render('index.html', {
      user: req.user
    })
  })
}