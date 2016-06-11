'use strict'

const id = x => x
const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
const toUpperCase = str => str.split(/\n/).map(str => str.toUpperCase()).join('\n')
const toLowerCase = str => str.toLowerCase()
const ucFirst = str => str.replace(/^(\s+)?(.)(.*)/, (t, a, b, c) => `${a||''}${(b||'').toUpperCase()}${(c||'').toLowerCase()}` )
const toName = str => toTitleCase(str).replace(nameLowerRE, (_, m) =>  m.toLowerCase())

const nameLowerRE = /(\s*(del|el|al|la|de|un|una|unas|unos|uno|the)\s+)/gi
const generatorRE = /([^\[]*)\[(?:([^@\]]+)@)?([^\[\]|]*)(?:\|([^\[\]]*))?\]/gm
const lastpartRE = /((?:.+)\])?(.*)$/

const FILTERS = {
  ucfirst: ucFirst,
  nombre: toName,
  name: toName,
  title: toTitleCase,
  titulo: toTitleCase,
  may: toUpperCase,
  min: toLowerCase,
  upper: toUpperCase,
  lower: toLowerCase
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
