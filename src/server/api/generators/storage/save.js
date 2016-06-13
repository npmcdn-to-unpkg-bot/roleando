'use strict'

const shortid = require('shortid')
const slug = require('slug')
const errors = require('restify-errors')

const insertOne = require('../../../../storage/insert_one')
const findOneAndUpdate = require('../../../../storage/find_one_and_update')
const validateTable = require('./validate')
const addLink = require('./add_link')


const slugify = str => slug((str || '').toLowerCase())

const processUpdate = raw => {
  const update = {}
  if (raw.data.tables ) {
    update['data.tables'] = raw.data.tables
  }
  if (raw.data.tpls) {
    update['data.tpls'] = raw.data.tpls
  }
  if (raw.data.remotes) {
    update['data.remotes'] = raw.data.remotes
  }
  update.name = raw.name
  update.desc = raw.desc
  update.slug = slugify(raw.name)
  return update
}

module.exports = (inId, newData) => validateTable(newData).then(() => {
  if (inId) {
    return findOneAndUpdate('generator_tables', { tableId: inId }, { $set: processUpdate(newData) }).then(op => {
      if (!op.ok) {
        return Promise.reject(new errors.BadRequestError('Can\'t save data'))
      }
      delete op.value._id
      op.value.owned = true
      return addLink(op.value)
    })
  }

  newData.tableId = shortid.generate()
  newData.createdAt = new Date()
  newData.slug = slugify(newData.name)
  return insertOne('generator_tables', newData)
    .then(op => {
      if (!op.result.ok) {
        return Promise.reject(new errors.BadRequestError('Can\'t save data'))
      }
      delete newData._id
      newData.owned = true
      return addLink(newData)
    })
})
