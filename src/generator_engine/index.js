'use strict'

const marked = require('marked')
const deepAssign = require('deep-assign')
const fetch = require('isomorphic-fetch')

const parser = require('./parser')
const createSelectors = require('./selector')
const makeGenerators = require('./generator')
const remotes = require('./remotes')
const sourceToRollTable = require('./transforms/source_to_table')
// const convertToContent = require('./to_content')

const HOST = '//roleando.herokuapp.com'
// const HOST = '//localhost:8080'

class Generador {

  constructor ({ token, host=HOST }={}) {
    this.token = token
    this.host = host
    this.remotes = remotes(this.token)
    this.contextList = [ null ]
  }

  getTokenFromAuth() {
    return fetch(`${this.host}/auth/token`, {
      headers: {"content-type": "application/json"},
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(res => {
        if (!res.token) {
          return Promise.reject()
        }
        this.setToken(res.token)
        return res.token
      })
  }

  setToken(token) {
    this.token = token
    this.remotes = remotes(this.token)
  }

  parseString(str) {
    this.data = deepAssign({}, this.data, parser(str))

    const promise = this.data.remotes ? this.loadRemotes(this.data.remotes) :  Promise.resolve(this)
    return promise.then(() => {

      this.selectors = createSelectors(this.data.sources, this.selectors || {})
      this.selectors = makeGenerators(this.data, this.selectors)
    })
  }

  loadRemotes(remoteList) {
    return Promise.all(Object.keys(remoteList).map(remoteId => {
      // TODO: check for already loaded remotes
      return this.remotes.load(remoteId)
        .then(res => {
          const str = `${res.data.tpls}\n${res.data.tables}`
          const context = this.data.remotes[remoteId].name

          const newData = parser(str, context)
          this.data = deepAssign({}, this.data, newData)
          this.contextList.push(context)

          if( newData.remotes) {
            return this.loadRemotes(newData.remotes)
          }

        })
    }))
  }

  generate(key) {
    if (key)  {
      return this.selectors[key] ? this.selectors[key]() : '';
    }

    return Object.keys(this.data.tpls).reduce((acc, name) => {
      return `${acc} ${this.selectors[name]()}`
    }, '')
  }

  toHtml(str) {
    return marked(str)
  }

  sourcesToRollTable(opts) {
    return sourceToRollTable(this.data.sources, opts)
  }
  // remoteToContent(remote) {
  //   return convertToContent(remote)
  // }

}
module.exports = Generador

process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);

});