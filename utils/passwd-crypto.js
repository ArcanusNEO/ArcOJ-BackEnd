const crypto = require('crypto')
const publicKey = require('../config/password-public-key')
const privateKey = require('../config/password-private-key')
const secret = require('../config/secret')
const md5 = require('./md5')

function encrypt(plain) {
  try {
    const buffer = Buffer.from(plain, 'utf8')
    return crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }, buffer).toString('base64')
  } catch (err) {
    console.log(err)
    return false
  }
}

function decrypt(cipher) {
  try {
    return crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }, Buffer.from(cipher, 'base64')).toString()
  } catch (err) {
    console.log(err)
    return false
  }
}

const hashPassword = (passwd) => {
  return md5(secret + passwd)
}

module.exports = { encrypt, decrypt, hashPassword }