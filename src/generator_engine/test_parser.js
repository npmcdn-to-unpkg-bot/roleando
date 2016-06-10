'use strict'

const Generator = require('./index')

const str = `
;@tablas
demo:ByX3oHwV
pnj:rJhS1i-N

;@plantilla|mytpl
una linea simple: [tabla]

;@plantilla|plan2
[aventuras.main]
[aventuras.main]
[demo.main]

;tabla
1, con mod x2: - [x5@tabla2] -
1, con mod 1d20: - [1d20@tabla2] -
1, con prob 33%: - [33%@tabla2] -
1, con prob 1/10: - [9/10@tabla2] -

;tabla2
1,linea1
1,linea2
1,linea3
`

const gen = new Generator()

gen.parseString(str)
  .then(() => {

    console.log('>>>> ')
    console.log( gen.generate('plan2'))
    console.log( gen.generate('mytpl'))
    console.log( gen.generate('aventuras.main'))
    console.log( gen.generate('tabla2'))
    console.log('>>>>>')

  })

