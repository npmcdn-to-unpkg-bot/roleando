'use strict'

const find = require('../../../../storage/find')

module.exports = (criteria={}) => find('generator_tables', criteria, {_id: 0, data: 0, authorId: 0})
  .then(list => list.toArray())
