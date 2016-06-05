'use strict'

const errors = require('restify-errors')

module.exports = (req, res, next) => {
  if (req.validToken) {
    return next()
  }

  return next(new errors.UnauthorizedError('Protected by auth token'))
}
