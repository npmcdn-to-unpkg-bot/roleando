'use strict'

import config from './config'

import auth from './auth/index'
import { load, create, createFromRemote, save, remove } from './generators/index'
import UI from './ui/index'

const Generators = () => {
  const obj = config

  // Auth
  obj.auth = auth(obj)

  // Factory
  obj.create = create(obj)
  obj.createFromRemote = createFromRemote(obj)

  // UI
  obj.ui = UI(obj)

  // Remote API
  obj.load = load(obj)
  obj.save = save(obj)
  obj.remove = remove(obj)

  // Printable
  // obj.toRollTables = toRollTables(generator)

  return obj

}

export default Generators()