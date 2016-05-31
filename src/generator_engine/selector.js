'use strict'

module.exports = tables => {

  const selectors = Object.keys(tables).reduce((obj, key) => {
    obj[key] = createWeightedSelector(tables[key])
    return obj
  }, {})

  return Object.assign(selectors, {
    get: key => selectors[key] ? selectors[key]() : '',
    keys: Object.keys(selectors)
  })
}

const createWeightedSelector = table => {
  const inSet = table.map(row => row[1])
  const inWeights =  table.map(row => row[0])
  if (!Array.isArray(inSet) || !Array.isArray(inWeights)) {
    throw new TypeError('Set and Weights must be arrays.')
  }
  const weights = (!inWeights) ? inSet.map(() => 1) : inWeights.map(x => Number(x))
  if (inSet.length !== inWeights.length) {
    throw new TypeError('Set and Weights are different sizes.')
  }

  const sum = weights.reduce((sum, weight) => sum + weight, 0)
  const weighted = weights.map(raw => raw / sum)

  return () => {
    let key = Math.random()
    let index = 0

    for (;index < weighted.length; index++) {
      key -= weighted[index]

      if (key < 0) {
        return inSet[index]
      }
    }
  }
}

