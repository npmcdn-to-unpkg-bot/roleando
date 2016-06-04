'use strict'

const PORT = process.env.PORT || 8080

module.exports = {
  port: PORT,
  name: 'Roleando',
  blogUrl: 'http://historiasdeunhobbit.wordpress.com',
  host: process.env.HOST || `http://localhost:${PORT}`,
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
    facebookAuth : {
      clientID        : 'your-secret-clientID-here', // your App ID
      clientSecret    : 'your-client-secret-here', // your App Secret
      callbackURL     : 'http://localhost:8080/auth/facebook/callback'
    },

    twitterAuth : {
      consumerKey        : 'your-consumer-key-here',
      consumerSecret     : 'your-client-secret-here',
      callbackURL        : 'http://localhost:8080/auth/twitter/callback'
    },

    googleAuth : {
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL : `${process.env.HOST}/auth/google/callback`
    }
  }

}
