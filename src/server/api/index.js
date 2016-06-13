'use strict'

const generatorsRoutes = require('./generators/routes')
const userProfile = require('./endpoints/me')
const checkAdmin = require('../middlewares/is_admin')

module.exports = app => {

  app.use(checkAdmin)

  // append generators API
  generatorsRoutes(app)
  
  // user API
  userProfile(app)

}