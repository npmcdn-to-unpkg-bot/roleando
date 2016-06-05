'use strict'

const cors = require('cors')

const requiresToken = require('../../middlewares/require_token')

const { save, find_all, find_one, remove } = require('./endpoints')
const checkOwner = require('./middlewares/check_owner')
const useCors = cors()

module.exports = app => {

  app.get('/api/generators/tables', useCors, find_all)
  app.get('/api/generators/tables/featured', useCors, find_all)
  app.get('/api/generators/table/:id', useCors, find_one)

  app.post('/api/generators/table', requiresToken, save)
  app.put('/api/generators/table/:id', requiresToken, checkOwner, save)
  app.delete('/api/generators/table/:id', requiresToken, checkOwner, remove)
}