'use strict'

const PORT = process.env.PORT || 80

module.exports = {
  port: PORT,
  name: 'Roleando',
  blogUrl: 'http://historiasdeunhobbit.wordpress.com',
  host: process.env.HOST || `//roleando.herokuapp.com`,
  database: {
    url: process.env.MONGODB_URI
  },
  auth: {
    sessionCookieExpiration: 86400 * 30, // 30 days
    sessionSecret: process.env.SESSION_SECRET || 'roleandovoy',
    tokenSecret: process.env.TOKEN_SECRET || 'roleandovoy',
    tokenExpiration: '30d'// expires in 30 days
  },
  passport: {
    googleAuth : {
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL : `${process.env.HOST}/auth/google/callback`
    }
  }

}
