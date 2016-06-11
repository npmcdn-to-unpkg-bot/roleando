'use strict'

const nodemailer = require('nodemailer')
const transport = require('nodemailer-sendgrid-transport')

const config = require('../config')

const DEFAULT_OPTIONS = {
  to: config.mailRecipient,
  from: config.mailRecipient
}
const sendgridConf = {
  auth: {
    api_user: config.sendgrid.user,
    api_key: config.sendgrid.pass
  }
}
const mailer =  nodemailer.createTransport(transport(sendgridConf))

module.exports = inOpts => {

  const options = Object.assign({}, DEFAULT_OPTIONS, inOpts)

  console.log('Sending mail', options)
  return mailer.sendMail(options)
    .then(res => {
      console.log('mail sent', res)
    })
    .catch(err => {
      console.log(err)
    })

}

