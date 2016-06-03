'use strict'

const generatorsRoutes = require('./generators/routes')


module.exports = app => {
    
    // append generators API
    generatorsRoutes(app)
}