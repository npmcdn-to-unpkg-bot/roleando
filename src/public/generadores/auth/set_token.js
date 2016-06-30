'use strict'

import { API_MAP } from './map'

export default obj => token => API_MAP.set(obj, { token })
