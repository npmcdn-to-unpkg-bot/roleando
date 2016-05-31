(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":2}],2:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],3:[function(require,module,exports){

const id = x => x
const range = size => Array.apply(null, Array(size))
const generatorRE = /\[(?:([^@\]]+)@)?([^\[\]]*)\]/gm
const hasMoreSelectors = str => str.match(generatorRE)
const dice = require('./roller')
const isDiceRoll = dice.isDiceRoll
const makeRoller = dice.makeRoller

const getModdedGenerator = (mod, gen) => {
   if (!mod) {
   	return gen
   }

   let match

   // repeat xN
   if (match = mod.match(/^x([0-9]+)/)) {
     const list = range(Number(match[1])).map(() => gen())
     return () => list.reduce((merged, fn) => merged + fn(), '')
   }

   // repeat diced dX
   if (match = isDiceRoll(mod)) {
      let [,roll,sides] = match
      let roller = makeRoller(mod)
   		return () => range(roller()).map(() => gen()).reduce((merged, fn) => merged + fn(), '')
   }
   return gen
}

const makeGenerator = (str, selectors, fromContext) => {
	const matches = []
  let match

  while (match = generatorRE.exec(str)) {
     let [pattern, mod, fullName] = match
     let [,context,name] = (fullName||'').match(/(?:([^\.]+)\.)?(.*)/)
     context = context || fromContext || 'main'

		 // only add known generators to the queue
          let dice
     if (dice = isDiceRoll(name)) {
				let roller = makeRoller(name)
        matches.push(fin => fin.replace(pattern, roller()))
     }

     let generator = selectors[`${context}.${name}`] || selectors[name]

     if (generator) {
        let moddedFn = getModdedGenerator(mod, generator)
        matches.push(fin => {
          const replaced = fin.replace(pattern, moddedFn())
          if (hasMoreSelectors(replaced)) {
             return makeGenerator(replaced, selectors, context)()
          }
          return replaced
        })
     }
  }

  return () => {
    return matches.reduce((finalStr, fn) => {
      return fn(finalStr)
    }, str)
  }
}

module.exports = makeGenerator

},{"./roller":8}],4:[function(require,module,exports){
'use strict'

const parser = require('./parser')
const createSelectors = require('./selector')
const createGenerator = require('./generator')
const remotes = require('./remotes')

const range = size => Array.apply(null, Array(size))

const source = `

;linea
1, DALE! viven [2d8] [don] tiene [mucha]

;don
1, [calle] tilingis de [mucha]
1, [mucha] - [mucha] personas
1, amigos [calle]

;calle
1,churri
1,moñas
1,sarao

;mucha
1,mierdecilla
1,enjundia
1,vidilla
`

const tpl = `[linea]`

const tables =  parser(source)
const selectors = createSelectors(tables)
const generator = createGenerator(tpl, selectors)

//console.log( tables, selectors )
//console.log( selectors.keys )
//console.log( selectors.prueba() )
//console.log( selectors.get('prueba') )
//console.log( selectors.get('prueba') )
//console.log( selectors.get('prueba') )
//console.log( selectors.get('sub1') )

console.log( range(10).map(() => generator() ).join('\n') )


const mng = remotes.get('myjson')

const name = 'refactor'

mng.load('3tewi').then(res => {
  console.log('LOADED', res)
})
.catch(err => console.log(err))

/*mng.save({
  name, tables
}).then(res => {
  console.log('SAVED', res)
})
.catch(err => console.log(err))
*/

},{"./generator":3,"./parser":5,"./remotes":6,"./selector":9}],5:[function(require,module,exports){
'use strict'

const id = x => x
const cleanLine = str => String(str).trim().replace(/\s+/, ' ')
const comments = str => !str.match(/^\/\//)
const isTableHeader = str => str.match(/^;.+/)
const parseContent = str => str.split(/\n/g).map(cleanLine).filter(id).filter(comments)

const parseLine = str => {
  const line = str.split(/(?!^[0-9.]+),/)
  return (line.length === 1 ? [1,line[0]] : line).map(cleanLine)
}

module.exports = str => {
  const lines = parseContent(str)
  let key = 'main'
  return lines.reduce((tables, line) => {
    if (isTableHeader(line)) {
      key = line.replace(/^;/, '')
      return tables
    }

    tables[key] = tables[key] || []
    tables[key].push(parseLine(line))
    return tables
  }, {})
}


},{}],6:[function(require,module,exports){
'use strict'

const SOURCES = {}

SOURCES.myjson = require('./myjson')

module.exports = {
  get: from => SOURCES[from]
}

},{"./myjson":7}],7:[function(require,module,exports){
'use strict'

const fetch = require('isomorphic-fetch')
const toJSON = res => res.json()

const MyJSON = {
  load: id => fetch(`https://api.myjson.com/bins/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(toJSON),
  save: data => fetch('https://api.myjson.com/bins', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then(toJSON).then(res => res.uri.replace('https://api.myjson.com/bins/', '')),
    update: (id, data) => fetch(`https://api.myjson.com/bins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(toJSON)
}

module.exports = MyJSON

},{"isomorphic-fetch":1}],8:[function(require,module,exports){
'use strict'

const range = size => Array.apply(null, Array(size))
const sum = arr => arr.reduce((total, curr) => total + curr,0)
const rand = (min, max) => Math.round(Math.random() * (max-min)) + min
const isDiceRoll = str => str.match(/([0-9]*)?d([0-9]+)(?:([+\-*/])([0-9]+))?/)
const rollDice = (sides, amount) => sum(range(amount||1).map(() => rand(1, sides)))
const makeRoller = str => {
	const parts = isDiceRoll(str)
  if (!parts) {
    return 0
  }

  let [,amount,sides, op, mod] = parts
  mod = Number(mod)
  sides = Number(sides)
  amount = Number(amount)
  return () => {
    const roll = rollDice(sides, amount)
    if (!op || !mod || mod === 0) {
      return roll
    }
    if (op === '+') return roll + mod
    if (op === '-') return roll - mod
    if (op === '*') return roll * mod
    if (op === '/') return Math.round(roll / mod)
    return roll
  }
}

module.exports = {
  makeRoller,
  isDiceRoll,
  rollDice
}


},{}],9:[function(require,module,exports){
'use strict'

module.exports = tables => {

  const selectors = Object.keys(tables).reduce((obj, key) => {
    obj[key] = createWeightedSelector(tables[key])
    return obj
  }, {})

  return Object.assign(selectors, {
    get: key => selectors[key] ? selectors[key]() : '',
    keys: Object.keys(selectors)
  })
}

const createWeightedSelector = table => {
  const inSet = table.map(row => row[1])
  const inWeights =  table.map(row => row[0])
  if (!Array.isArray(inSet) || !Array.isArray(inWeights)) {
    throw new TypeError('Set and Weights must be arrays.')
  }
  const weights = (!inWeights) ? inSet.map(() => 1) : inWeights.map(x => Number(x))
  if (inSet.length !== inWeights.length) {
    throw new TypeError('Set and Weights are different sizes.')
  }

  const sum = weights.reduce((sum, weight) => sum + weight, 0)
  const weighted = weights.map(raw => raw / sum)

  return () => {
    let key = Math.random()
    let index = 0

    for (;index < weighted.length; index++) {
      key -= weighted[index]

      if (key < 0) {
        return inSet[index]
      }
    }
  }
}


},{}]},{},[4]);
