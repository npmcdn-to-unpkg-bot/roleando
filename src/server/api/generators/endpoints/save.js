'use strict'

const save = require('../storage/save')

module.exports = (req, res, next) => {

  const data = req.body
  data.author = req.user.name
  data.authorId = req.user._id
  data.authorImg = req.user.google.picture
  data.featured = false
  save(req.params.id, data)
    .then(saved => {

      res.status(200).send(saved)
    })
    .catch(next)
}