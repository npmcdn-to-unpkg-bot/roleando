
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
