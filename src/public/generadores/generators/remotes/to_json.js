'use strict'

export default res => {
  if (res.status >= 400) return res.json().then(err => Promise.reject(err))
  return res.json()
}

