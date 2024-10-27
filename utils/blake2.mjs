import crypto from 'crypto'
const blake2 = (string) => {
  'use strict'
  return crypto.createHash('BLAKE2b512').update(string).digest('hex')
}

export default blake2
