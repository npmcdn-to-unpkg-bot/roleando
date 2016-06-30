'use strict'

const Generator = require('./../src/generator_engine/index')

const str = `
;@tablas
// aventuras:H1JTSHyN
// pnj:rJhS1i-N

;@plantilla|adjetivos_test
con genero: [nombre_completo|nombre]
uno neutro m/f: [adjetivos_neutros|+artm|upper] / [adjetivos_neutros|+artf|upper|nombre]


;@plantilla|mytpl
tab equal/nombre: - [tabla2] - [tabla2|nombre] - [tabla2|nombre] -
.
tab lower/upper: [tabla|nombre] / [tabla|nombre]
tab2 lower/upper: [tabla2|nombre] & [tabla2|nombre] ---
fin

// ;@plantilla|plan2
// [aventuras.main|upper]
// [aventuras.main]
// [demo.main]

;nombre_completo
el [nombre|nombre] [adjetivos|fem|+artf]
la [nombre|nombre] [adjetivos|fem|+artf]
un [nombre|nombre] [adjetivos|fem|+artf]

;nombre
Josena
Argan
doran
lisan

;tabla
1, con mod x2: - [x3@tabla2|upper] [x2@tabla2|lower] UeeeEwE-
1, con mod 1d20: - [1d20@tabla2|nombre] -
1, con prob 33%: - [33%@tabla2|lower] -
1, con prob 1/10: - [9/10@tabla2|upper] -

;tabla2
1,elsan juan de la larca
1,el monte de dema
1,el SumO LaRPE del barro

;adjetivos
caro
alto
delgado
gordo
gordo
listo
listo
fanfarrón
abusador
haragán
magnifico
supremo
holgazán
regordete

;adjetivos_neutros
facil
dificil
feliz
grande
inteligente
verde
rosa
`

const gen = new Generator()

gen.parseString(str)
  .then(() => {

    console.log('>>>> ')
    // console.log( gen.generate('plan2'))
    console.log( gen.generate('adjetivos_test'))
    // console.log( gen.generate('aventuras.main'))
    // console.log( gen.generate('tabla2'))
    console.log('>>>>>')

  })

