'use strict'


module.exports = data => {

  const remotes = Object.keys(data.remotes).reduce((total, remote) => {
    const info = data.remotes[remote]
    return  `${total}\n${info.name}:${info.id}`
  }, `;@remotes`)

  const tpls = Object.keys(data.tpls).reduce((total, tpl) => {
    return  `${total}\n;@tpl|${tpl}\n${data.tpls[tpl]}\n`.replace(/\n+$/gm, '\n')
  }, '')

  const tabs = Object.keys(data.sources).reduce((total, table) => {
    return  `${total}\n;${table}\n${data.sources[table].reduce((lines, line) => `${lines}${line.join(',')}\n`, '')}\n`
  }, '')

  return { remotes, tpls, tabs }
}