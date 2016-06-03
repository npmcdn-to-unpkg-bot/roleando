'use strict'

const collection = require('./collection')

module.exports = (col, criteria, update) =>  collection(col).then(col => col.findOneAndUpdate(criteria, update, { returnOriginal: false }))
