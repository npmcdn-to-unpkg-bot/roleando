'use strict'

const marked = require('marked')

const parser = require('./parser')
const createSelectors = require('./selector')
const createGenerators = require('./generator')
const remotes = require('./remotes')
const convertToContent = require('./to_content')

const toHtml = str => marked(str)

module.exports = {
  init: (str) => {
    const data = parser(str)
    data.selectors = createSelectors(data.sources)
    data.generators = createGenerators(data, data.selectors)
    return data
  },
  remotes,
  convertToContent,
  toHtml
}

