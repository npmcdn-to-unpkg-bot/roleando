'use strict'

import fetch from 'isomorphic-fetch'
import config from '../config'
import setToken from './set_token'

export default obj => () => {
  return fetch(`${config.HOST}/auth/token`, {
    headers: {"content-type": "application/json"},
    credentials: 'same-origin'
  })
    .then(res => res.json())
    .then(res => {
      if (!res.token) {
        return Promise.reject()
      }
      setToken(obj)(res.token)
    })
}
