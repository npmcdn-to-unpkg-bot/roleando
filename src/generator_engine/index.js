'use strict'

const marked = require('marked')

const parser = require('./parser')
const createSelectors = require('./selector')
const createGenerator = require('./generator')

const toHtml = str => marked(str)

module.exports = {
  parser, createSelectors, createGenerator, toHtml
}

