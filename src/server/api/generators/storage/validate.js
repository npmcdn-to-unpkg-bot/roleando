'use strict'

const validator = require('../../../../util/validator')

const schema = {
  title: 'Generator Table',
  type: 'object',
  properties: {
    name: 'string',
    desc: 'string',
    author: 'string',
    content: 'string',
    id: 'string'
  },
  required: ['name', 'author', 'content']
}

module.exports = data => validator(data, schema)