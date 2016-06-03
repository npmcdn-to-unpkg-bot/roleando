'use strict'

const tv4 = require('tv4')

module.exports = (obj, schema) => {

  if (!schema) {
    return Promise.reject(new Error('Can\'t validate against an empty schema'))
  }

  const result = tv4.validateMultiple(obj, schema)

  if (result.valid) {
    return Promise.resolve(obj)
  }

  const errors = result.errors.map(err => `${err.message} ${err.dataPath}`.trim())

  return Promise.reject(new Error(errors.join(', ')))
}