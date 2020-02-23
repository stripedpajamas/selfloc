const { bold, greenBright } = require('colorette')
const randomRange = require('random-number-csprng-2')

async function * index () {
  let idx = 1
  while (true) {
    const digits = []
    let n = idx
    while (n) {
      digits.unshift(n % 10)
      n = Math.floor(n / 10)
    }
    yield digits
    idx++
  }
}

async function * randomDigit () {
  while (true) {
    yield randomRange(0, 9)
  }
}

// unused; helpful for logic checking
async function * orderedDigit () {
  let i = 0
  while (true) {
    yield i++
  }
}

async function * take (iter, count) {
  let group = []
  for await (const item of iter) {
    if (group.length === count) {
      yield group
      group = []
    }
    group.push(item)
  }
  yield group // in case the iterable has < count items
}

// given an iterable and an output size (e.g. 4):
// [1,2,3,4]
// [2,3,4,5]
// [3,4,5,6]
// [6,7,8,9]
async function * tick (iter, size) {
  const { value: buffer, done: empty } = await take(iter, size * 2).next()
  if (empty || buffer.length <= size) {
    yield buffer
    return
  }

  while (buffer.length) {
    yield buffer.slice(0, size)

    buffer.shift() // tick

    const next = await iter.next()
    if (next.done) {
      continue
    }
    buffer.push(next.value) // tock
  }

  yield buffer
}

async function * merge (iter1, iter2) {
  let next1 = await iter1.next()
  let next2 = await iter2.next()
  while (!next1.done && !next2.done) { // cancel if either iterable empties out
    yield [next1.value, next2.value]
    next1 = await iter1.next()
    next2 = await iter2.next()
  }
}

function isSelfLocating (location, digits) {
  for (let i = 0; i < location.length; i++) {
    if (location[i] !== digits[i]) return false
  }
  return true
}

async function main () {
  // we won't be going higher than 16 digits (Number.MAX_SAFE_INTEGER == 9007199254740991)
  console.log('looking for self locating numbers in a stream of random digits...')
  const previous = []
  let farAlong = false
  for await (const [location, digits] of merge(index(), tick(randomDigit(), 16))) {
    if (isSelfLocating(location, digits)) {
      const ellipsis = farAlong ? '...' : ''
      const head = previous.join('')
      const match = bold(greenBright(location.join('')))
      const tail = digits.slice(location.length).join('')
      process.stdout.write(`${ellipsis}${head}${match}${tail}`)
    }
    previous.push(digits.shift())
    if (previous.length > 16) {
      previous.shift()
      farAlong = true
    }
  }
}

main()
