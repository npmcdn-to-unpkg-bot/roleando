'use strict'

const gen = require('./index')

const str = `
;@tablas
demo:H1JTSHyN

;@plantilla|mytpl
this tpl is mega way [tabla]
y tiene CERO lineas [tabla2]

;@plantilla|otra
[tabla] tienen [tabla2]
y tiene [3d4] lineas [tabla]

;tabla
1,review
2,gran
1,dia
1,estado
1,aquella
1,cosas
1,justo

;tabla2
1,linea B
1, linea B2
1, sobre 2
1, nueva
1,zonas
1, grande

`

const data = gen.init(str)
console.log( data.generators.mytpl(), data.generators.otra() )

console.log(gen.convertToContent(data))