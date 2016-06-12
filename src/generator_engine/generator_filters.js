'use strict'

const id = x => x
const {
  toTitleCase, toUpperCase, toLowerCase, ucFirst, toName,
  addArticle, addArticleFemale, addArticleMale, toFemale, toMale
} = require('./filters')

const generatorRE = /([^\[]*)\[(?:([^@\]]+)@)?([^\[\]|]*)(?:\|([^\[\]]*))?\]/gm
const lastpartRE = /((?:.+)\])?(.*)$/

const FILTERS = {

  name: toName,
  frase: ucFirst,
  title: toTitleCase,
  upper: toUpperCase,
  lower: toLowerCase,
  male: toMale,
  female: toFemale,

  '+art': addArticle,
  '+artm': addArticleMale,
  '+artf': addArticleFemale,

  ucfirst: ucFirst,
  nombre: toName,
  titulo: toTitleCase,
  may: toUpperCase,
  min: toLowerCase,
  masc: toMale,
  fem: toFemale
}

const applyOuter = (str, fn) => {
  let newStr = str, lastIndex, match;
  while (match = generatorRE.exec(str)) {
    newStr = newStr.replace(match[1], fn(match[1]))
    lastIndex = match.index
  }
  return  newStr.replace(lastpartRE, (str, m1, m2) => `${m1 || ''}${fn(m2)}` )
}

module.exports = strFilters => {
  const filters = strFilters ? strFilters.split('|') : null
  if (!strFilters || !filters) {
    return id
  }

  return str => {
    return filters.filter(id).reduce((moddedStr, filter) => {
      let fn  = FILTERS[filter]

      return fn ? applyOuter(moddedStr, fn) : moddedStr
    }, str)
  }
}
