let jwt = require('jsonwebtoken')
let secret = require('../config/secret')
let cookieOpts = require('../config/cookie')

let options = {
  expiresIn: '7d'
}
const sign = (content) => {
  return jwt.sign(content, secret, options)
}
//verify a token symmetric
const verify = (token) => {
  return jwt.verify(token, secret)
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

module.exports = { sign, verify, decode, write, remove, get }
