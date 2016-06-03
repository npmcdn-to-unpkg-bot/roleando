'use strict'

const findOne = require('../storage/find_one')

module.exports = (user, id) => {

  if (!user) {
    return Promise.reject(new Error('User not logged in'))
  }
  return findOne(id)
    .then(found => {
      if (!found) {
        return Promise.reject(new Error('Can\'t find content'))
      }

      if (found.author !== user.google.name) {
        return Promise.reject(new Error('Content not owned'))
      }
      return true
    })

}