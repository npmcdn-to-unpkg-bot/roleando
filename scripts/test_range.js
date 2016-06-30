'use strict'

const RANGES = [3, 4, 6, 8, 10, 12, 20, 100]

const min = arr => arr.reduce((prev, next) => Math.min(prev,next[0]), arr[0][0])

const convertToRollTable = source => {

  let total = source.reduce((total, item) => total + item[0], 0)
  const minVal = min(source)
  const evenlyDistributed = (minVal * source.length) === total
  total = evenlyDistributed ? source.length : total // Math.ceil(total / minVal)

  const convertir = RANGES.find(x => total <= x) || 100
  const step = convertir/total
  const unit = Math.floor(step)
  const offset = step % 1

  let lastIndex = 0
  let reminderAcc = 0
  let sum = 0

  return source.reduce((list, rawItem) => {
    let x = evenlyDistributed ? 1 : rawItem[0]
    let bottom = lastIndex+1
    let top = lastIndex + (x*unit)
    sum += x
    reminderAcc += (offset*x)

    if (reminderAcc > 1) {
      top += Math.floor(reminderAcc)
      reminderAcc -=  Math.floor(reminderAcc)
    }

    if (sum === total && top < convertir) {
      top = convertir
    }
    lastIndex = top
    let label = top-bottom === 0 ? bottom : `${bottom}-${top}`

    list.push([label, rawItem[1]])

    return list
  }, [])
}

const pruebas = [
  [32,"una poción"],
  [32,"un elixir"],
  [32,"un brebaje"],
  [32,"un vial"],
  [22,"un tanque"],
  [5,"un filtro"],
  [12,"un filtro"],
  [1,"un filtro"]
]

  const res = convertToRollTable(pruebas)
  console.log('salida:')
  console.log('\t'+ res.join('\n\t'))
