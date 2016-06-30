'use strict'

let  HOST = '//roleando.herokuapp.com'

if (process.env.NODE_ENV === 'development') {
  HOST = '//localhost:8080'
}

export default {
  HOST,
  generators: {
    BASE_URL: '/api/generators'
  }
}