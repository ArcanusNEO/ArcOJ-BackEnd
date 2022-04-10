import jwt from 'jsonwebtoken'
import salt from '../config/salt.mjs'
import cookieOpts from '../config/cookie.mjs'

const options = {
  expiresIn: '7d'
}
const sign = (content) => {
  return jwt.sign(content, salt, options)
}
//verify a token symmetric
const verify = (token) => {
  return jwt.verify(token, salt)
}
//Returns the decoded payload without verifying if the signature is valid
const decode = (token) => {
  return jwt.decode(token)
}

const write = (res, property, content) => {
  let token = sign(content)
  res.cookie(property, token, cookieOpts)
}

const remove = (res, property) => {
  res.clearCookie(property)
}

const get = (req, property) => {
  let token = req.cookies[property]
  return verify(token)
}

export default { sign, verify, decode, write, remove, get }
