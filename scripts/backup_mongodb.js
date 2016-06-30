'use strict'

const backup = require('mongodb-backup')

backup({
  uri: process.env.MONGODB_URI,
  root: `${__dirname}/backup/`,
  collections: [ 'generator_tables' ],
  logger: 'out.log'
})