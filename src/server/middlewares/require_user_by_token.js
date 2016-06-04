'use strict'

const User = require('../passport/models/user')

module.exports = () => (req, res, next) => {

  const token = req.params.token || req.body.token || (req.header('Authorization') || '').replace('Bearer ', '')
  if (!token) {
    return next()
  }

  User.findByToken(token)
    .then(res => {
      if (res && res.hasValidToken()) {
        req.validToken = true
        return next()
      }
      return next(new Error('Unauthorized'))
    })
    .catch(next)

}