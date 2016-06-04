'use strict'

const save = require('../storage/save')

module.exports = (req, res, next) => {

  const data = req.body
  data.author = req.user.name
  save(req.params.id, data)
    .then(saved => {

      res.status(200).send(saved)
    })
    .catch(next)

}