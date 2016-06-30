'use strict'

import RandomGenerator from '@guumaster/rpg-generator-engine'

export const create = obj => {
  return (str='') => {
    const generator = new RandomGenerator({ host: obj.host })
    return str ? generator.addContent(str) : Promise.resolve(generator)
  }
}
