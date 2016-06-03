'use strict'

const save = require('../storage/save')

module.exports = (req, res, next) => {


  save(req.params.id, req.body)
    .then(saved => {

      res.status(200).send(saved)
    })
    .catch(next)

}