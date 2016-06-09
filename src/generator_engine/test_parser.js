'use strict'

const Generator = require('./index')

const str = `
;@tablas
demo:ByX3oHwV
//pnj:rJhS1i-N

;@plantilla|mytpl
 una linea simple: [tabla]
 otra: [demo.main]
 sub sub: [demo.explorando]

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

gen.parseString(str)
  .then(data => {

    // console.log( range(10).map(() => gen.generate() ))
    console.log( gen.generate())
    // console.log( gen.data.generators)
    // console.log( gen.data.generators.mytpl())

  })


//console.log( JSON.stringify(data, null, 2))

