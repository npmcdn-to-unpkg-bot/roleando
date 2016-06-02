'use strict'

const parse = require('./parser')
const selectors = require('./selector')
const generators = require('./generator')

const str = `

;tabla
1,review
2,gran
1,dia
1,estado
1,aquella
1,cosas
1,justo

;@tablas
nombre:gist:1234
otro:myjson:1235

;@plantilla|mytpl
this tpl is mega way [tabla]
y tiene CERO lineas [tabla2]

;@plantilla|otra
[tabla] tienen [tabla2]
y tiene [3d4] lineas [tabla]

;tabla2
1,linea B
1, linea B2
1, sobre 2
1, nueva
1,zonas
1, grande

`

const data = parse(str)

//console.log( JSON.stringify(data, null, 2) )
const sel = selectors(data.sources)
const gen = generators(data, sel)
console.log( gen.mytpl(), gen.otra() )
