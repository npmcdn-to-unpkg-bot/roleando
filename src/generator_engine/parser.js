'use strict'

const id = x => x
const cleanLine = str => String(str).trim().replace(/\s+/, ' ')
const comments = str => !str.match(/^\/\//)
const isTableHeader = str => str.match(/^;.+/)
const parseContent = str => str.split(/\n/g).map(cleanLine).filter(id).filter(comments)

const parseLine = str => {
  const line = str.split(/(?!^[0-9.]+),/)
  return (line.length === 1 ? [1,line[0]] : line).map(cleanLine)
}

module.exports = str => {
  const lines = parseContent(str)
  let key = 'main'
  return lines.reduce((tables, line) => {
    if (isTableHeader(line)) {
      key = line.replace(/^;/, '')
      return tables
    }

    tables[key] = tables[key] || []
    tables[key].push(parseLine(line))
    return tables
  }, {})
}

