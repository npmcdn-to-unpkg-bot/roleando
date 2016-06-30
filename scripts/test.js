'use strict'

const Generator = require('@guumaster/rpg-generator-engine')

const myGenerator = new Generator()
myGenerator.fromRemote('H1JTSHyN').then(() => {
  console.log( myGenerator.generate() )
})
.catch(err => console.log(err.stack))
