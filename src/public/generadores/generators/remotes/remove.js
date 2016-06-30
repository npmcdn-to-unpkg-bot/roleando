'use strict'

import fetch from 'isomorphic-fetch'

import getHeaders from './get_headers'
import config from '../../config'

export const remove = obj => id => fetch(`${config.generators.BASE_URL}/table/${id}`, {
  method: 'DELETE',
  credentials: 'same-origin',
  headers: getHeaders(obj)
})
