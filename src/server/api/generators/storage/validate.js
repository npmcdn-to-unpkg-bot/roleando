'use strict'

const validator = require('../../../../util/validator')

const schema = {
  title: 'Generator Table',
  type: 'object',
  properties: {
    name: 'string',
    desc: 'string',
    author: 'string',
    parent: 'string',
    featured: 'boolean',
    data: {
      type: 'object',
      properties: {
        remotes: 'string',
        tpls: 'string',
        tables: 'string'
      },
      required: ['tables']
    },
    id: 'string'
  },
  required: ['name', 'author', 'data']
}

module.exports = data => validator(data, schema)