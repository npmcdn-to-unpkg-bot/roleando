'use strict'

import setToken from './set_token'
import getToken from './get_token'
import getTokenFromAuth from './get_token_from_auth'

export default obj =>  {
  return {
    setToken: setToken(obj),
    getToken: getToken(obj),
    getTokenFromAuth: getTokenFromAuth(obj),
  }
}
