'use strict'

import  fetch  from 'isomorphic-fetch'

import toJSON from './to_json'
import getHeaders from './get_headers'

import config from '../../config'

export const save = obj => data => {
  return fetch(`${config.generators.BASE_URL}/table${ data.id ? `/${data.id}` : ''}`, {
    method: `${ data.id ? 'PUT' : 'POST' }`,
    credentials: 'same-origin',
    body: JSON.stringify(data),
    headers: getHeaders(obj)
  }).then(toJSON)
}
