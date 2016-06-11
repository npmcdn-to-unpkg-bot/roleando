'use strict'
const range = size => Array.apply(null, Array(size))
const dice = require('./roller')
const isDiceRoll = dice.isDiceRoll
const makeRoller = dice.makeRoller

module.exports = (mod, gen) => {
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
