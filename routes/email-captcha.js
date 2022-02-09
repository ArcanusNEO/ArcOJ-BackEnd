let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let fc = require('./midwares/form-check')
let sr = require('string-random')
let tokenUtils = require('../utils/token')
let email = require('../utils/email')
let md5 = require('../utils/md5')
let salt = require('../config/secret')

router.post('/', fc(['body'], ['email']), async (req, res) => {
  let captcha = sr(5)
  let md5C = md5(captcha + salt)
  tokenUtils.write(res, 'ec', { md5C: md5C })
  let ret = await email(req.body['email'], `您的验证码是：\n${captcha}`)
  if (ret) return res.sendStatus(hsc.ok)
  else return res.sendStatus(hsc.internalSrvErr)
})

module.exports = router
