'use strict'

const errors = require('restify-errors')

const remove = require('../../../../storage/remove')

module.exports = id => remove('generator_tables', { tableId: id }).then(op => {
  if (!op.result.ok) {
    return Promise.reject(new errors.BadRequestError('Can\'t remove table'))
  }
  return true
})
