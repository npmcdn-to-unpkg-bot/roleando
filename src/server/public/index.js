'use strict'

const config = require('../../config')
const findAll = require('../api/generators/storage/find_all')
module.exports = app => {

  app.get('/blog', (req, res) => res.redirect(config.blogUrl))

  app.get('/generadores', (req, res) => {
    findAll({ featured: true })
      .then(generators => {
        res.render('generadores/index.html', {
          user: req.user,
          generators
        })
      })
  })

  app.get('/', (req, res) => {
    res.render('index.html', {
      user: req.user
    })
  })
}