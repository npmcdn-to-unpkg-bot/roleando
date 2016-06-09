'use strict'

const Generator = require('./index')

const str = `
;@tablas
demo:H1JTSHyN
pnj:rJhS1i-N

;@plantilla|mytpl
 una linea simple: [tabla]
 otra: [sub.main]
 sub sub: [sub.explorando]

;tabla
1, con mod x2: - [x5@tabla2] -
1, con mod 1d3: - [1d20@tabla2] -
1, con prob 33%: - [33%@tabla2] -
1, con prob 1/10: - [9/10@tabla2] -

;tabla2
1,linea1
1,linea2
1,linea3
`

const range = size => Array.apply(null, Array(size))

const gen = new Generator()
const data = gen.parseString(str)
console.log( range(10).map(() => data.generate() ))
console.log( data.generate())

//console.log( JSON.stringify(data, null, 2))
gen.loadRemotes()

