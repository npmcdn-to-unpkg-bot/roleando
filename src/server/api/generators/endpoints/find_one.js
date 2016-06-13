'use strict'

const errors = require('restify-errors')
const findOne = require('../storage/find_one')
const addOwned = require('../storage/add_owned')

module.exports = (req, res, next) => {

  findOne(req.params.id)
    .then(found => {
      if (!found) {
        return next(new errors.NotFoundError('Not found'))
      }
      res.status(200).send(addOwned(found, req.user))
    })
    .catch(next)
}