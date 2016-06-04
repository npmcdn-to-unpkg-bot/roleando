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

  // repeat xN
  if (match = mod.match(/^x([0-9]+)/)) {
    const list = range(Number(match[1])).map(() => gen())
    return () => list.reduce((merged, fn) => merged + fn(), '')
  }

  // repeat diced dX
  if (match = isDiceRoll(mod)) {
    let roller = makeRoller(mod)
    return () => range(roller()).map(() => gen()).reduce((merged, fn) => merged + fn(), '')
  }
  return gen
}

const makeOneGenerator = (str, selectors, fromContext) => {
  const matches = []
  let match

  while (match = generatorRE.exec(str)) {
    let [pattern, mod, fullName] = match
    let [,context,name] = (fullName || '').match(/(?:([^\.]+)\.)?(.*)/)
    context = context || fromContext || 'main'

    // only add known generators to the queue
    let dice
    if (dice = isDiceRoll(name)) {
      let roller = makeRoller(name)
      matches.push(fin => fin.replace(pattern, roller()))
    }

    let generator = selectors[`${context}.${name}`] || selectors[name]

    if (generator) {
      let moddedFn = getModdedGenerator(mod, generator)
      matches.push(fin => {
        const replaced = fin.replace(pattern, moddedFn())
        if (hasMoreSelectors(replaced)) {
          return makeOneGenerator(replaced, selectors, context)()
        }
        return replaced
      })
    }
  }

  return () => {
    return matches.reduce((finalStr, fn) => {
      return fn(finalStr)
    }, str)
  }
}

const makeGenerators = (data, selectors) => {
  return Object.keys(data.tpls).reduce((obj, tpl) => {
    obj[tpl] = makeOneGenerator(data.tpls[tpl], selectors)
    return obj
  }, {})
}

module.exports = makeGenerators
