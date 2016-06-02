'use strict'

const id = x => x
const cleanLine = str => String(str).trim().replace(/\s+/, ' ')
const comments = str => !str.match(/^\/\//)
const splitLines = str => str.split(/\n/g).map(cleanLine).filter(id).filter(comments)

const parseLine = str => {
  const [, num, line] = str.match(/(?:([0-9.]+),)?(.*)/)
  return  num ? [Number(num), cleanLine(line)] : [1,line]
}

const parseRemoteLine = str => {
  const [, name, src, id] = str.match(/([^:]+):([^:]+):(.*)/)
  return [id, { name, src, id }]
}

const matchRemoteHeader = str => str.match(/^;@(usa|use|remote|tablas)/)
const matchTemplateHeader = str => str.match(/^;@(?:tpl|plantilla)\|(.*)/)
const matchTableHeader = str => str.match(/^;(.*)/)

module.exports = str => {
  const lines = splitLines(str)
  let match, clean
  let key = 'main'
  let type = 'sources'
  return lines.reduce((sources, line) => {

    // is remote table
    if (match = matchRemoteHeader(line)) {
        type = 'remotes'
        return sources
    }

    // is template
    if (match = matchTemplateHeader(line)) {

      [, key] = match
      type = 'tpls'
      return sources
    }

    // normal table
    if (match = matchTableHeader(line)) {
      [, key] = match
      type = 'sources'
      return sources
    }

    // IS NOT HEADER, ADD LINE
    if (type !== 'remotes') {
      sources[type][key] = sources[type][key] || []
    }

    if (type === 'sources') {
      clean = parseLine(line)
      if (clean[1]) {
        sources[type][key].push(clean)
      }
    }

    if (type === 'tpls') {
      sources[type][key] += line + "\n"
    }

    if (type === 'remotes') {
      const remote = parseRemoteLine(line)
      sources[type][remote[0]] = remote[1]
    }
    return sources
  }, {
    sources: {},
    tpls: {},
    remotes: {}
  })
}

