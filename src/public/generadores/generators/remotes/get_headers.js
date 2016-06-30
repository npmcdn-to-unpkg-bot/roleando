'use strict'

export default obj => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${obj.auth.getToken()}`
  }
}
