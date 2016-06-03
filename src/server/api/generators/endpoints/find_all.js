'use strict'

const findAll = require('../storage/find_all')

module.exports = (req, res, next) => {

  findAll()
    .then(list => {
      res.status(200).send(list)
    })
    .catch(next)
}