'use strict'

module.exports = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin()) {
    req.isAdmin = true
  }
  return next()
}
