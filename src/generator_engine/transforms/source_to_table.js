'use strict'

const deepAssign = require('deep-assign')

const RANGES = [3, 4, 6, 8, 10, 12, 20, 100]
const min = arr => arr.reduce((prev, next) => Math.min(prev,next[0]), arr[0][0])

const sourceToRollTable = source => {

  let total = source.reduce((total, item) => total + item[0], 0)
  const minVal = min(source)
  const evenlyDistributed = (minVal * source.length) === total
  total = evenlyDistributed ? source.length : total

  const convertir = RANGES.find(x => total <= x) || 100
  const step = convertir/total
  const unit = Math.floor(step)
  const offset = step % 1

  let lastIndex = 0
  let reminderAcc = 0
  let sum = 0

  return source.reduce((list, rawItem) => {
    let x = evenlyDistributed ? 1 : rawItem[0]
    let bottom = lastIndex+1
    let top = lastIndex + (x*unit)
    sum += x
    reminderAcc += (offset*x)

    if (reminderAcc > 1) {
      top += Math.floor(reminderAcc)
      reminderAcc -=  Math.floor(reminderAcc)
    }

    if (sum === total && top < convertir) {
      top = convertir
    }
    lastIndex = top
    let label = top-bottom === 0 ? bottom : `${bottom}-${top}`

    list.push([label, rawItem[1]])

    return list
  }, [])
}

const header = (opts, name) => opts.header.replace('[name]', name)

module.exports = (sources, opts) => {
  const options = deepAssign({}, {
    container: `<table class="rolltable">[rows]</table>`,
    header: `<tr><th></th><th class="title">[name]</th></tr>`,
    row: `<tr><td class="roll">[roll]</td><td class="line">[line]</td></tr>`
  }, opts)
  return Object.keys(sources).reduce((obj, source) => {
    const rows = sourceToRollTable(sources[source])

    obj[source] = options.container.replace('[rows]', rows.reduce((html, row) => {
      return html + options.row.replace('[roll]', row[0]).replace('[line]', row[1])
    }, header(options, source)))
    return obj
  }, {})
}
