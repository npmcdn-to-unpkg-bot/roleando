'use strict'

const requiresLogin = require('../../middlewares/is_logged_in')

const { save, find_all, find_one, remove } = require('./endpoints')
const checkOwner = require('./middlewares/check_owner')

module.exports = app => {

  app.get('/api/generators/tables', find_all)
  app.get('/api/generators/table/:id', find_one)

  app.post('/api/generators/table', requiresLogin, save)
  app.put('/api/generators/table/:id', requiresLogin, checkOwner, save)
  app.del('/api/generators/table/:id', requiresLogin, checkOwner, remove)
}