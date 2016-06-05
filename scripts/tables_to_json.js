'use strict'

const fs = require('fs')

const FILE = process.argv[2]

console.log('FILE', FILE)
const content = fs.readFileSync(FILE).toString().replace(/\r\n/gm, '\n')

console.log('cont', JSON.stringify({
  content
}))