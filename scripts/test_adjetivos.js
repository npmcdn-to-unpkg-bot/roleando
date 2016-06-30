'use strict'

/*
 sustantivos: http://babelnet.sbg.ac.at/carlitos/ayuda/sustantivos.htm

 adjetivos: http://babelnet.sbg.ac.at/carlitos/ayuda/adjetivos.htm#concordancia

 - Si el adjetivo termina en “-o” formamos el femenino cambiando la “o” por “a”.

 - Si el adjetivo termina en “e” o en “a",en el femenino no cambia.

 - Si el adjetivo termina en “-án, -ón, -or”, formamos el femenino añadiendo “a”

 - Si el adjetivo termina en  “-ete”, “-ote” la “e” cambia por “a”

 - El resto de los adjetivos terminado en consonante no cambian.

 - 	Recuerda que los adjetivos que indican el origen: país, ciudad, provincia, etc.;
      si terminan en consonante, se forma el femenino añadiendo “a”. (Nota que el acento desaparece. )

  */
const {
  isGeneric, addArticleFemale, addArticleMale, toFemale, toMale
} = require('./../src/generator_engine/filters/index')

const lista = [ 'caro', 'alto', 'delgado',
  'gordo', 'gorda', 'listo', 'lista',
  'fanfarrón', 'abusador', 'haragán',
  'magnifico', 'supremo', 'holgazán', 'regordete',
  'facil', 'dificil', 'feliz', 'grande', 'inteligente',
  'verde', 'rosa',
  'alemán',
]

lista.map(name => {
  console.log(` ${isGeneric(name) ? '* ': '  '}${addArticleMale(toMale(name))} / ${addArticleFemale(toFemale(name))}`)
})

console.log(lista.map(toMale))