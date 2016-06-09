'use strict'

const marked = require('marked')
const deepAssign = require('deep-assign');
const fetch = require('isomorphic-fetch')

const parser = require('./parser')
const createSelectors = require('./selector')
const createGenerators = require('./generator')
const remotes = require('./remotes')
// const convertToContent = require('./to_content')

const HOST = '//roleando.herokuapp.com'

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
    const data = parser(str)
    //data.selectors = createSelectors(data.sources)
    // data.generators = createGenerators(data, data.selectors)
    this.data = data

    const promise = data.remotes ? this.loadRemotes(data.remotes) :  Promise.resolve(this)
    return promise.then(res => {

      this.data.selectors  = deepAssign({}, this.data.selectors, createSelectors(this.data.sources))

      this.data.generators = createGenerators(this.data.tpls, this.data.selectors)
      console.log('done');
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

  generate() {
    return Object.keys(this.data.generators).reduce((acc, name) => {
      return `${acc} ${this.data.generators[name]()}`
    }, '')
  }

  toHtml(str) {
    return marked(str)
  }

  listFeatured() {
    return this.remotes.listFeatured()
  }

  remoteToContent(remote) {
    return convertToContent(remote)
  }

}
module.exports = Generador

process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging, throwing an error, or other logic here
});