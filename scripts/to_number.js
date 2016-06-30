'use strict'

const UNIDADES = '|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve'.split('|')
const DECENA_BAJA = 'diez|once|doce|trece|catorce|quince'.split('|')
const DECENA = '|||treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa'.split('|')
const CENTENAS = '||docientos|trecientos|cuatrocientos|quinientos|seicientos|setecientos|ochocientos|novecientos'.split('|')

const aUnidad = num => UNIDADES[num] || ''

const resto = (num, divisor) => num - (Math.floor(num / divisor) * divisor)

const aDecenas = num => {
  const decena = Math.floor(num/10)
  const unidad = resto(num, 10)

  if (!decena) {
    return aUnidad(unidad)
  }
  if (decena < 2) {
    return (unidad <=5) ? DECENA_BAJA[unidad] : `dieci${aUnidad(unidad)}`
  }
  if (decena < 3) {
    return (unidad == 0) ? 'veinte' : `veinti${aUnidad(unidad)}`
  }

  return unidad === 0 ? DECENA[decena] : `${DECENA[decena]} y ${aUnidad(unidad)}`
}

const aCentenas = num => {
  const centenas = Math.floor(num / 100)
  const decenas = resto(num, 100)

  if (!centenas) {
    return aDecenas(decenas)
  }

  if (centenas === 1) {
    return decenas > 0 ? `ciento ${aDecenas(decenas)}` : 'cien'
  }

  return `${CENTENAS[centenas]} ${aDecenas(decenas)}`
}

const aMiles = num => `${aSeccion(num, 1000, 'mil', 'mil') || ''} ${aCentenas(resto(num, 1000))}`

const aMillones = num => `${aSeccion(num, 1000000, 'un millon', 'millones') || ''} ${aMiles(resto(num, 1000000))}`

const aSeccion = (num, divisor, strSingular, strPlural) => {
  const cientos = Math.floor(num / divisor)

  if (!cientos) {
    return ''
  }
  if (cientos === 1) {
    return  strSingular
  }
  return `${aCentenas(cientos)} ${strPlural}`
}

// funciona hasta 999.999.999
module.exports = (num, uno=false) => {
  const enteros = Math.floor(num)
  if (!enteros) return 'cero'
  const palabras = aMillones(enteros)
  return uno ? palabras.replace(/un$/, 'uno') : palabras
}