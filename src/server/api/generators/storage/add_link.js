'use strict'

const config = require('../../../../config')

const HOST = config.host

module.exports = generator => {
  if (!generator) return
  
  generator.link = `/generadores/${generator.slug}/${generator.tableId}`
  generator.shortLink = `${HOST}/rg/${generator.tableId}`
  return generator
}
