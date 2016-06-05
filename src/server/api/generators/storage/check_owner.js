'use strict'

const errors = require('restify-errors')
const findOne = require('../storage/find_one')

module.exports = (user, id) => {

  if (!user) {
    return Promise.reject(new errors.UnauthorizedError('User not logged in'))
  }
  return findOne(id)
    .then(found => {
      if (!found) {
        return Promise.reject(new errors.NotFoundError('Can\'t find content'))
      }

      if (!user._id.equals(found.authorId)) {
        return Promise.reject(new errors.UnauthorizedError('Content not owned'))
      }
      return true
    })

}