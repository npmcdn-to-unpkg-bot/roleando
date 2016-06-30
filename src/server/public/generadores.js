'use strict'

const config = require('../../config')
const findAll = require('../api/generators/storage/find_all')
const findOne = require('../api/generators/storage/find_one')
const addOwned = require('../api/generators/storage/add_owned')

const printableGenerators = require('../api/generators/printable_generators')

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
      .then(generator => addOwned(generator, req.user))
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

  app.get('/generadores/imprimir', (req, res, next) => {
    const lista = (req.query.id || '').split(',')

    findAll({ tableId: {$in: lista }}, true)
      .then(generators => {
        printableGenerators(generators).then(lista => {
          res.render('generadores/imprimir.html', {
            user: req.user,
            generators: lista
          })
        })


      })
      .catch(next)

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
