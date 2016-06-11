'use strict'

const mailer = require('../../../util/mailer')

module.exports = generator => {

  mailer({
    subject: `[ROLEANDO] Nuevo generador "${generator.name}" (${process.env.NODE_ENV})`,
    text: formatText(generator)
  })
}

const formatText = generator => `
Nombre: "${generator.name}" 

Link: ${generator.link}

Decripcion: "${generator.desc}"

Autor: "${generator.author}"

`
