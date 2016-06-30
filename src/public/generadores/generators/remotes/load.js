'use strict'

import fetch from 'isomorphic-fetch'

import toJSON  from './to_json'
import getHeaders from './get_headers'

import config  from '../../config'

export const load = obj => id => fetch(`${config.generators.BASE_URL}/table/${id}`, {
  method: 'GET',
  credentials: 'same-origin',
  headers: getHeaders(obj)
}).then(toJSON)
