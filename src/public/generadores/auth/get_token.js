'use strict'

import { API_MAP } from './map'

export default obj => token => API_MAP.has(obj) ? API_MAP.get(obj).token : null
