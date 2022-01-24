let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let fc = require('./midwares/form-check')
let sr = require('string-random')
let tokenUtils = require('../utils/token')
let email = require('../utils/email')

router.post('/', fc(['body'], ['email']), async (req, res) => {
  let captcha = sr(5)
  tokenUtils.write(res, 'ec', { captcha: captcha })
  await email(req.body['email'], `您的验证码是：\n${captcha}`)
  return res.sendStatus(hsc.ok)
})

module.exports = router
