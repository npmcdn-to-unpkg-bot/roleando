'use strict'

const save = require('../storage/save')
const notifyNewGenerator = require('../notify_new_generator')

module.exports = (req, res, next) => {

  const data = req.body
  data.author = req.user.name
  data.authorId = req.user._id
  data.authorImg = req.user.google.picture
  data.featured = false

  save(req.params.id, data)
    .then(saved => {

      res.status(200).send(saved)

      if (!req.params.id) {
        notifyNewGenerator(saved)
      }

    })
    .catch(next)
}