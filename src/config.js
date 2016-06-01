'use strict'


module.exports = {
  port: process.env.PORT,
  name: 'Roleando',

  database: {
    url: process.env.MONGODB_URI
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
