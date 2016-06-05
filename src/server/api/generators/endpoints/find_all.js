'use strict'

const findAll = require('../storage/find_all')

module.exports = (req, res, next) => {

  const criteria = {}
  if (req.originalUrl.match('/featured')) {
    criteria.featured = true
  }
  findAll(criteria)
    .then(list => {

      list.forEach(row => row.own = req.user ? req.user._id.equals(row.authorId) : false)
      return list
    })

    .then(list => {

      res.status(200).send(list)
    })
    .catch(next)
}