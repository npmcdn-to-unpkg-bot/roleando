'use strict'

const fetch = require('isomorphic-fetch')
const toJSON = res => res.json()

const MyJSON = {
  load: id => fetch(`https://api.myjson.com/bins/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(toJSON),
  save: data => fetch('https://api.myjson.com/bins', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then(toJSON).then(res => res.uri.replace('https://api.myjson.com/bins/', '')),
    update: (id, data) => fetch(`https://api.myjson.com/bins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(toJSON)
}

module.exports = MyJSON
