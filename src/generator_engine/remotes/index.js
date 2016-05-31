'use strict'

const SOURCES = {}

SOURCES.myjson = require('./myjson')

module.exports = {
  get: from => SOURCES[from]
}
