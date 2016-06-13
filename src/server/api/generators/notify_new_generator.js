'use strict'

const config = require('../../../config')
const mailer = require('../../../util/mailer')
const HOST = config.host

module.exports = generator => {

  mailer({
    subject: `[ROLEANDO] Nuevo generador "${generator.name}" (${process.env.NODE_ENV})`,
    text: formatText(generator)
  })
}

const formatText = generator => `
Nombre: "${generator.name}" 

Link: ${HOST}${generator.link}

Decripcion: "${generator.desc}"

Autor: "${generator.author}"

`
