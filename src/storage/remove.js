'use strict'

const collection = require('./collection')

module.exports = (col, criteria) => {
  return collection(col).then(col => col.remove(criteria))
}