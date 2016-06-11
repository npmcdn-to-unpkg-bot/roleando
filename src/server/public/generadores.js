'use strict'

const config = require('../../config')
const findAll = require('../api/generators/storage/find_all')
const findOne = require('../api/generators/storage/find_one')

module.exports = app => {

  app.get('/generadores', (req, res, next) => {

    Promise.all([
      findAll({ featured: true }),
      findAll({ featured: false })
    ])
      .then(data => {
        res.render('generadores/index.html', {
          user: req.user,
          featured: data[0],
          generators: data[1]
        })
      })
      .catch(next)
  })

  app.get('/generadores/:slug/:id', (req, res, next) => {
    findOne(req.params.id)
      .then(generator => {
        res.render('generadores/index.html', {
          user: req.user,
          generator,
          isNewOrEdit: !!req.query.edit
        })
      })
      .catch(next)
  })

  app.get('/generadores/new', (req, res) => {
    res.render('generadores/index.html', {
      user: req.user,
      isNewOrEdit: true
    })
  })

  app.get('/rg/:id', (req, res, next) => {
    findOne(req.params.id)
      .then(generator => {
        if (!generator) {
          return res.redirect('/')
        }

        return res.redirect(301, generator.link)
        
      })
      .catch(next)
  })


}
