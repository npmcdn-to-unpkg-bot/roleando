'use strict'

const request = require('request-promise')
const sortBy = require('lodash/sortBy')
const uniq = require('lodash/uniq')

const TYPE = 'Quest'
const BATCH = 2000
const URL = `http://donjon.bin.sh/fantasy/random/rpc.cgi?type=${TYPE}&n=${BATCH}`

Promise.all([
  request({ url: URL, json: true}),
  request({ url: URL, json: true}),
  request({ url: URL, json: true})
]).then(res => {
  // console.log(res.length)
  const list = res[0].concat(res[1]).concat(res[2])
  console.log(JSON.stringify(uniq(sortBy(list)), null, 2))
})
