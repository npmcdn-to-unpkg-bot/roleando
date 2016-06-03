'use strict'

const db = require('./db')

module.exports = col => db.getDb().then(db => db.collection(col))