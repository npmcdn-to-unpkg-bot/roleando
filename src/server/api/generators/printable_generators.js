'use strict'

const RandomGenerator = require('@guumaster/rpg-generator-engine')

module.exports = generators => {
  return Promise.all(generators.map(src => {
    const generator = new RandomGenerator({ host: `://localhost:${process.env.PORT}` })
    return generator.addContent(`${src.data.remotes||''}${src.data.tpls||''}${src.data.tables||''}`)
      .then(() => {
        src.printable = generator.toRollTables()
        return src
      })
  }))
}
