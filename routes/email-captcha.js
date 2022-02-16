const express = require('express')
const router = express.Router()
const hsc = require('../config/http-status-code')
const fc = require('./midwares/form-check')
const sr = require('string-random')
const tokenUtils = require('../utils/token')
const email = require('../utils/email')
const md5 = require('../utils/md5')
const salt = require('../config/salt')

router.post('/', fc(['body'], ['email']), async (req, res) => {
  let captcha = sr(5)
  let md5C = md5(captcha + salt)
  tokenUtils.write(res, 'ec', { md5C: md5C })
  let ret = await email(req.body['email'], `您的验证码是：\n${captcha}`)
  if (ret) return res.sendStatus(hsc.ok)
  return res.sendStatus(hsc.internalSrvErr)
})

module.exports = router
