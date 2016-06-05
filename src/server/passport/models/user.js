'use strict'

const selectn = require('selectn')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const config = require('../../../config')
const ObjectId = mongoose.Schema.ObjectId

// define the schema for our user model
var userSchema = mongoose.Schema({
  name: String,
  token: String,
  google: {
    id: String,
    token: String,
    email: String,
    picture: String,
    name: String
  }
})

const getNewToken = id => {
  return jwt.sign({ id }, config.auth.tokenSecret, {
    expiresIn: config.auth.tokenExpiration
  })
}

userSchema.pre('save', function (next) {
  if (this.isNew) {
    this._id = new ObjectId()
    this.token = getNewToken(this._id.toString())
  }
  
  if (!this.name) {
    this.name = selectn('google.name', this)
  }

  return next()
})

userSchema.statics.findByToken = function (token) {
  return this.findOne({ token })
}

userSchema.methods.hasValidToken = function () {
  try {
    return jwt.verify(this.token, config.auth.tokenSecret)
  } catch (err) {
    return false
  }
}

userSchema.methods.refreshToken = function () {
  this.token = getNewToken(this._id.toString())
}

module.exports = mongoose.model('User', userSchema)
