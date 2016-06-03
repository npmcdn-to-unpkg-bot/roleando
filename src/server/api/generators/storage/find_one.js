'use strict'

const findOne = require('../../../../storage/find_one')

module.exports = id => findOne('generator_tables', { tableId: id }, { _id: 0 })
