'use strict'

const collection = require('./collection')

module.exports = (col, data) => collection(col).then(col => col.insertOne(data))
