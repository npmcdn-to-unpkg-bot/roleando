'use strict'

const marked = require('marked')

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
    data.selectors = createSelectors(data.sources)
    data.generators = createGenerators(data, data.selectors)
    data.generate = this.generateAll.bind(data)
    this.data = data
    return data
  }

  toHtml(str) {
    return marked(str)
  }

  loadRemotes() {
    const fetchRemote = remote => this.remotes.load(remote)
    Promise.all(Object.keys(this.data.remotes).map(remoteId => {
      return fetchRemote(remoteId)
      .then(res => {
        const str = `${res.data.tpls}\n${res.data.tables}`
        const context =this.data.remotes[remoteId].name

        const data = parser(str, context)
        data.selectors = createSelectors(data.sources, context)
        data.generators = createGenerators(data, data.selectors, context)
        data.generate = this.generateAll.bind(data)

        // TODO: merge all generators
        console.log('data', data.generate() )
      })
    }))
    .then(res => {

      console.log('done');
    })

  }
  generateAll() {
    return Object.keys(this.generators).reduce((acc, name) => {
      return `${acc} ${this.generators[name]()}`
    }, '')
  }

  listFeatured() {
    return this.remotes.listFeatured()
  }

   remoteToContent(remote) {
     return convertToContent(remote)
   }

}
module.exports = Generador
