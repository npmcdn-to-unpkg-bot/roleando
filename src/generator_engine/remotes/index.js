'use strict'

module.exports = Object.assign(require('./roleando_api'), {
  join: remote => `${remote.data.remotes}\n${remote.data.tpls}\n${remote.data.tables}`
})