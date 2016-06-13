'use strict'

const PORT = process.env.PORT || 80

const getAdminUsers = () => (process.env.ADMIN_USERS||'').split(',')

module.exports = {
  port: PORT,
  name: 'Roleando',
  blogUrl: 'http://historiasdeunhobbit.wordpress.com',
  host: process.env.HOST || `//roleando.herokuapp.com`,
  mailRecipient: process.env.MAIL_RECIPIENT,
  database: {
    url: process.env.MONGODB_URI
  },
  auth: {
    sessionCookieExpiration: 86400 * 30 * 1000, // 30 days
    sessionSecret: process.env.SESSION_SECRET || 'roleandovoy',
    tokenSecret: process.env.TOKEN_SECRET || 'roleandovoy',
    tokenExpiration: '30d', // expires in 30 days
    adminUsers: getAdminUsers()
  },
  sendgrid: {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_PASSWORD
  },
  passport: {
    googleAuth : {
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL : `${process.env.HOST}/auth/google/callback`
    }
  }

}
