import crypto from 'crypto'
import publicKey from '../config/password-public-key.mjs'
import privateKey from '../config/password-private-key.mjs'
import secret from '../config/secret.mjs'
import md5 from './md5.mjs'

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

export default { encrypt, decrypt, hashPassword }