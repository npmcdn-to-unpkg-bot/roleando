'use strict'

const generatorsRoutes = require('./generators/routes')
const userProfile = require('./endpoints/me')


module.exports = app => {

  // append generators API
  generatorsRoutes(app)
  
  // user API
  userProfile(app)

}