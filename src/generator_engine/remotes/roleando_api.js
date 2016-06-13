'use strict'

const fetch = require('isomorphic-fetch')

const host = process.env.HOST || `//roleando.herokuapp.com`
const baseUrl = `${host}/api/generators`

const toJSON = res => {
  if (res.status >= 400) return res.json().then(err => Promise.reject(err))
  return res.json()
}

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
const getHeaders = token  => {
  return Object.assign({
    'Authorization': `Bearer ${token}`
  }, headers)
}
const RoleandoAPI = token => ({
  listFeatured: id => fetch(`${baseUrl}/tables/featured`, {
    method: 'GET',
    credentials: 'same-origin',
    headers
  }).then(toJSON),
  load: id => fetch(`${baseUrl}/table/${id}`, {
    method: 'GET',
    credentials: 'same-origin',
    headers
  }).then(toJSON),
  create: data => fetch(`${baseUrl}/table`, {
    method: 'POST',
    credentials: 'same-origin',
    body: JSON.stringify(data),
    headers: getHeaders(token)
  }).then(toJSON),
  update: (id, data) => fetch(`${baseUrl}/table/${id}`, {
    method: 'PUT',
    credentials: 'same-origin',
    body: JSON.stringify(data),
    headers: getHeaders(token)
  }).then(toJSON),
  remove: (id, data) => fetch(`${baseUrl}/table/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: getHeaders(token)
  })
})

module.exports = RoleandoAPI
