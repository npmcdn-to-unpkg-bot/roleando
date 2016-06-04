'use strict'

const requiresToken = require('../../middlewares/require_token')

const { save, find_all, find_one, remove } = require('./endpoints')
const checkOwner = require('./middlewares/check_owner')

module.exports = app => {

  app.get('/api/generators/tables', find_all)
  app.get('/api/generators/table/:id', find_one)

  app.post('/api/generators/table', requiresToken, save)
  app.put('/api/generators/table/:id', requiresToken, checkOwner, save)
  app.delete('/api/generators/table/:id', requiresToken, checkOwner, remove)
}