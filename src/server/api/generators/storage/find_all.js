'use strict'

const find = require('../../../../storage/find')
const addLink = require('./add_link')

module.exports = (criteria={}, data=false) => {
  const projection = {_id: 0, authorId: 0}
  if (!data) {
    projection.data = 0
  }
  criteria.deleted = { $not: { $exists: true }}
  criteria.unlisted = { $not: { $exists: true }}
  return find('generator_tables', criteria, projection)
    .then(list => list.sort({createdAt: 1 }).toArray())
    .then(list => list.map(addLink))
}
