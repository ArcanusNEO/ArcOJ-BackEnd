import crypto from 'crypto'
const md5 = (string) => {
  'use strict'
  return crypto.createHash('md5').update(string).digest('hex')
}

export default md5
