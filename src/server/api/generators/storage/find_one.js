'use strict'

const findOne = require('../../../../storage/find_one')
const addLink = require('./add_link')

module.exports = id => findOne('generator_tables', { tableId: id, deleted:  { $not: { $exists: true }} }, { _id: 0 }).then(addLink)
