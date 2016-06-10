'use strict'

const range = size => Array.apply(null, Array(size))
const generatorRE = /\[(?:([^@\]]+)@)?([^\[\]]*)\]/gm
const hasMoreSelectors = str => str.match(generatorRE)
const dice = require('./roller')
const isDiceRoll = dice.isDiceRoll
const makeRoller = dice.makeRoller

const getModdedGenerator = (mod, gen) => {
  if (!mod) {
    return gen
  }

  let match

  // [x3@string] repeat xN
  if (match = mod.match(/^x([0-9]+)/)) {
    const list = range(Number(match[1])).map(() => () => gen())
    return () => list.reduce((merged, fn) => `${merged}${fn()} `, '')
  }

  // [3d6@string] repeat diced dX
  if (match = isDiceRoll(mod)) {
    let roller = makeRoller(mod)
    return () => range(roller()).map(() => () => gen()).reduce((merged, fn) => `${merged}${fn()} `, '')
  }

  // [1/3@string] dice probability of appearance
  if (match = mod.match(/^([0-9]+)\/([0-9]+)/)) {
    const [, prob, total] = match

    if (!total) return gen

    let roller = makeRoller(`1d${total}`)
    return () => {
      return roller() <= prob ? gen() : ''
    }
  }

  // [x%@string] % probability of appearance
  if (match = mod.match(/^([0-9]+)%/)) {
    const [, prob] = match

    if(!prob) {
      return ''
    }

    if (prob>=100) {
      return gen
    }

    let roller = makeRoller('1d100')
    return () => roller() <= prob ? gen() : ''
  }


  return gen
}

const execReplacement = (str, selectors, fromContext) => {
  const lines = str.split(/\n/)

  return lines.reduce((final, line) => {
    let match
    if (!hasMoreSelectors(line)) {
      return `${final}\n${line}`
    }

    while (match = generatorRE.exec(line)) {
      let [pattern, mod, fullName] = match
      let [,context,name] = (fullName || '').match(/(?:([^\.]+)\.)?(.*)/)
      context = context || fromContext || 'main'

      // only add known generators to the queue
      let dice
      if (dice = isDiceRoll(name)) {
        let roller = makeRoller(name)
        line = line.replace(pattern, roller())
      }

      let generator = selectors[`${context}.${name}`] || selectors[name]

      if (generator) {
        let moddedFn = getModdedGenerator(mod, generator)
        line = line.replace(pattern, moddedFn())

        if (hasMoreSelectors(line)) {
          line = execReplacement(line, selectors, context)
        }
      }
    }
    return `${final}\n${line}`

  }, '')
}

module.exports = (data, selectors) => {
  return Object.keys(data.tpls).reduce((obj, tpl) => {
    obj[tpl] = () => {
      let [,context] = (tpl || '').match(/(?:([^\.]+)\.)?(.*)/)
      context = context || 'main'
      return execReplacement(data.tpls[tpl], selectors, context)
    }
    return obj
  }, selectors)
}
