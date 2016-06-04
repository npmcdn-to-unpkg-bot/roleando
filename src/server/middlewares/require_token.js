'use strict'

module.exports = (req, res, next) => {
  if (req.validToken) {
    return next()
  }

  return next(new Error('Unauthorized'))
}
