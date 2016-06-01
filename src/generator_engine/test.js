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
1,moas
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

/*
mng.save({
    name, tables
}).then(res => {
  console.log('SAVED', res)
})
.catch(err => console.log(err))
*/
