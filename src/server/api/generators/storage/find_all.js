'use strict'

const find = require('../../../../storage/find')
const addLink = require('./add_link')

module.exports = (criteria={}) => {
  criteria.deleted = { $not: { $exists: true }}
  criteria.unlisted = { $not: { $exists: true }}
  return find('generator_tables', criteria, {_id: 0, data: 0, authorId: 0})
    .then(list => list.sort({createdAt: 1 }).toArray())
    .then(list => list.map(addLink))
}
