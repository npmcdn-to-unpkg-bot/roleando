'use strict'

const errors = require('restify-errors')

const remove = require('../../../../storage/remove')

module.exports = id => findOneAndUpdate('generator_tables', { tableId: inId }, { $set: { deleted: true }}).then(op => {
  if (!op.ok) {
    return Promise.reject(new errors.BadRequestError('Can\'t remove data'))
  }
  return op.value
})