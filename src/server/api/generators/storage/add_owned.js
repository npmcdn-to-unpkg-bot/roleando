'use strict'

module.exports = (generator, user) => {
  if (!generator) return

  if (!user) return generator

  generator.owned = user._id.equals(generator.authorId) || user.isAdmin()
  return generator
}
