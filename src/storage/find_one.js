'use strict'

const collection = require('./collection')

module.exports = (col, criteria, options) => {
  return collection(col).then(col => col.find(criteria, options).limit(1).next())
}