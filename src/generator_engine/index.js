'use strict'

const marked = require('marked')

const parser = require('./parser')
const createSelectors = require('./selector')
const createGenerator = require('./generator')

const toHtml = str => marked(str)

module.exports = {
  init: (str) => {
    const data = parse(str)
    data.selectors = selectors(data.sources)
    data.generators = generators(data, data.selectors)
    return data
  },
  toHtml
}

