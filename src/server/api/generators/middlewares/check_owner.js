'use strict'

const checkOwner = require('../storage/check_owner')

module.exports = (req, res, next) => {

  checkOwner(req.user, req.params.id)
    .then(() =>  next())
    .catch(next)
}