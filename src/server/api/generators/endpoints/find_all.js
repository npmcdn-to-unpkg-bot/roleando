'use strict'

const findAll = require('../storage/find_all')
const addOwned = require('../storage/add_owned')

module.exports = (req, res, next) => {

  const criteria = {}
  if (req.originalUrl.match('/featured')) {
    criteria.featured = true
  }
  findAll(criteria)
    .then(list => {
      return list.map(item => addOwned(item, req.user))
    })
    .then(list => {
      res.status(200).send(list)
    })
    .catch(next)
}