'use strict'

const remove = require('../storage/remove')

module.exports = (req, res, next) => {

  remove(req.params.id)
    .then(() => res.sendStatus(204))
    .catch(next)
}