'use strict'

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

const User = require('./models/user')
const config = require('../../config')
const configAuth = config.passport

module.exports = passport => {

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
      done(err, user)
    })
  })

  passport.use(new GoogleStrategy({
      clientID: configAuth.googleAuth.clientID,
      clientSecret: configAuth.googleAuth.clientSecret,
      callbackURL: configAuth.googleAuth.callbackURL,
      passReqToCallback: true
    },
    function (req, token, refreshToken, profile, done) {
      process.nextTick(() => {

        // check if the user is already logged in
        if (!req.user) {

          User.findOne({'google.id': profile.id}, function (err, user) {
            if (err) {
              return done(err)
            }

            if (user) {

              // if there is a user id already but no token (user was linked at one point and then removed)
              if (!user.google.token) {
                user.google.token = token
                user.google.name = profile.displayName
                user.google.email = (profile.emails[0].value || '').toLowerCase() // pull the first email

                user.google.picture = profile.photos ? profile.photos[0].value : ''

                user.save(function (err) {
                  if (err)
                    return done(err)

                  return done(null, user)
                })
              }

              return done(null, user)
            } else {
              var newUser = new User()
              console.log('PIC', profile)

              newUser.google.id = profile.id
              newUser.google.token = token
              newUser.google.name = profile.displayName
              newUser.google.email = (profile.emails[0].value || '').toLowerCase() // pull the first email
              newUser.google.picture = profile.photos ? profile.photos[0].value : ''


              newUser.save(function (err) {
                if (err)
                  return done(err)

                return done(null, newUser)
              })
            }
          })

        } else {
          // user already exists and is logged in, we have to link accounts
          var user = req.user // pull the user out of the session
          console.log('PIC', profile)

          user.google.id = profile.id
          user.google.token = token
          user.google.name = profile.displayName
          user.google.email = (profile.emails[0].value || '').toLowerCase() // pull the first email
          user.google.picture =  profile.photos ? profile.photos[0].value : ''

          user.save(function (err) {
            if (err)
              return done(err)

            return done(null, user)
          })
        }
      })
    }))
}
