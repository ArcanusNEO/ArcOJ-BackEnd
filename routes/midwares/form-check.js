let crypto = require('../../utils/passwd-crypto')
let hsc = require('../../config/http-status-code')

const nickname = (req, pos, item) => {
  if (!req[pos][item]) return false
  try {
    if (!/^.{1,11}$/g.test(req[pos][item])) throw Error('Invalid nickname')
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}

const realname = (req, pos, item) => {
  if (!req[pos][item]) return false
  try {
    if (!/^.{1,40}$/g.test(req[pos][item])) throw Error('Invalid realname')
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}

const words = (req, pos, item) => {
  if (!req[pos][item]) return false
  try {
    if (!/^.{1,140}$/g.test(req[pos][item])) throw Error('Invalid words')
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}


const school = (req, pos, item) => {
  if (!req[pos][item]) return false
  try {
    if (!/^.{1,50}$/g.test(req[pos][item])) throw Error('Invalid school name')
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}

const email = (req, pos, item) => {
  if (!req[pos][item]) return false
  try {
    if (req[pos][item].indexOf('@') === -1) req[pos][item] += '@mail.nankai.edu.cn'
    req[pos][item] = req[pos][item].toLowerCase()
    if (!/^[0-9a-z_-]+@[0-9a-z_-]+(\.[0-9a-z_-]+)+$/igs.test(req[pos][item])
      || !/@(mail\.)?nankai\.edu\.cn$/igs.test(req[pos][item])) throw Error('Invalid email address')
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}

const username = email

const password = (req, pos, item) => {
  if (!req[pos][item]) return false
  try {
    req[pos][item] = crypto.decrypt(req[pos][item])
    if (!/^[\w-\.~!@#$\^&\*\+=:'",<>\?/]{6,20}$/g.test(req[pos][item])) throw Error('Invalid password')
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}

const qq = (req, pos, item) => {
  if (!req[pos][item]) return false
  try {
    if (!/^[1-9]\d{4,11}$/.test(req[pos][item])) throw Error('Invalid QQ number')
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}

const tel = (req, pos, item) => {
  if (!req[pos][item]) return false
  try {
    if (!/^(\d{11}|(\d{2,4}-)?\d{7,8}(-\d{1,4})?)$/.test(req[pos][item])) throw Error('Invalid Telephone number')
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}

module.exports = (poss, items, errCode = hsc.parseErr, errMsg = { ok: false }) => {
  return (req, res, next) => {
    let rep = true
    poss.forEach((pos) => {
      items.forEach((item) => {
        switch (item) {
          case 'username':
            rep &= username(req, pos, item)
            break

          case 'email':
            rep &= email(req, pos, item)
            break

          case 'password':
            rep &= password(req, pos, item)
            break

          case 'nickname':
            rep &= nickname(req, pos, item)
            break

          case 'qq':
            rep &= qq(req, pos, item)
            break

          case 'tel':
            rep &= tel(req, pos, item)
            break

          case 'realname':
            rep &= realname(req, pos, item)
            break

          case 'school':
            rep &= school(req, pos, item)
            break

          case 'words':
            rep &= words(req, pos, item)
            break
        }
      })
    })
    if (rep) return next()
    return res.status(errCode).json(errMsg)
  }
}