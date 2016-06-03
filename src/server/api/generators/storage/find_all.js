'use strict'

const find = require('../../../../storage/find')

module.exports = () => find('generator_tables', {}, {_id: 0, content: 0}).then(list => list.toArray())
