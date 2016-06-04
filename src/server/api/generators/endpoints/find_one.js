'use strict'

const errors = require('restify-errors')
const findOne = require('../storage/find_one')

module.exports = (req, res, next) => {

  findOne(req.params.id)
    .then(found => {
      if (!found) {
        return next(new errors.NotFoundError('Not found'))
      }
      res.status(200).send(found)
    })
    .catch(next)
}