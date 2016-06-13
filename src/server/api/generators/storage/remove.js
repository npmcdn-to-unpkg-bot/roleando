'use strict'

const errors = require('restify-errors')
const findOneAndUpdate = require('../../../../storage/find_one_and_update')
const remove = require('../../../../storage/remove')

module.exports = id => findOneAndUpdate('generator_tables', { tableId: id }, { $set: { deleted: true }}).then(op => {
  if (!op.ok) {
    return Promise.reject(new errors.BadRequestError('Can\'t remove data'))
  }
  return op.value
})