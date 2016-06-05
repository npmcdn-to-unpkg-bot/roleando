'use strict'

const fetch = require('isomorphic-fetch')

const host = process.env.HOST || `//roleando.herokuapp.com`
const baseUrl = `${host}/api/generators`

const toJSON = res => res.json()

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
const getHeaders = token  => {
  return Object.assign({
    'Authorization': `Bearer ${token}`
  }, headers)
}
let SAVED_TOKEN

const RoleandoAPI = {
  token: null,
  setToken: function (token) { SAVED_TOKEN = token },
  list: id => fetch(`${baseUrl}/tables`, {
    method: 'GET',
    credentials: 'same-origin',
    headers
  }).then(toJSON),
  load: id => fetch(`${baseUrl}/table/${id}`, {
    method: 'GET',
    credentials: 'same-origin',
    headers
  }).then(toJSON),
  create: data => fetch(`${baseUrl}/table/${id}`, {
    method: 'POST',
    credentials: 'same-origin',
    body: JSON.stringify(data),
    headers: getHeaders(SAVED_TOKEN)
  }).then(toJSON),
  update: (id, data) => fetch(`${baseUrl}/table/${id}`, {
    method: 'PUT',
    credentials: 'same-origin',
    body: JSON.stringify(data),
    headers: getHeaders(SAVED_TOKEN)
  }).then(toJSON),
  remove: (id, data) => fetch(`${baseUrl}/table/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: getHeaders(SAVED_TOKEN)
  }).then(toJSON)
}

module.exports = RoleandoAPI
