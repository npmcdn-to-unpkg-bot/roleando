'use strict'

const config = require('../../config')

module.exports = app => {

  app.get('/blog', (req, res) => res.redirect(config.blogUrl))

  app.get('/generadores', (req, res) => {
    res.render('generadores/index.html', {
      user: req.user
    })
  })

  app.get('/', (req, res) => {
    res.render('index.html', {
      user: req.user
    })
  })
}