'use strict'

const MongoClient = require('mongodb').MongoClient
const config = require('../config')

const SINGLETON = {}

module.exports = {

  getDb: () => {
    if (SINGLETON.db) {
      return Promise.resolve(SINGLETON.db)
    }

    return MongoClient.connect(config.database.url).then(db => {
      SINGLETON.db = db
      return db
    })
  }
}
