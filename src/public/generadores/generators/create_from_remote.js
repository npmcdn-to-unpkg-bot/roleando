'use strict'

import RandomGenerator from '@guumaster/rpg-generator-engine'

export const createFromRemote = obj => {
  return remoteId => {
    const generator = new RandomGenerator({ host: obj.HOST })
    return generator.fromRemote(remoteId)
  }
}
