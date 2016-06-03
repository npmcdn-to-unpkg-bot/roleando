'use strict'

const collection = require('./collection')

module.exports = (col, criteria, options) => collection(col).then(col => col.find(criteria, options))
