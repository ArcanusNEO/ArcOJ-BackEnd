import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import fc from './midwares/form-check.mjs'
import sr from 'string-random'
import tokenUtils from '../utils/token.mjs'
import email from '../utils/email.mjs'
import md5 from '../utils/md5.mjs'
import salt from '../config/salt.mjs'
import smco from './midwares/strict-mode-check-obj.mjs'

router.use(smco.passcodeForbid)

router.post('/', fc(['body'], ['email']), async (req, res) => {
  let captcha = sr(5)
  let md5C = md5(captcha + salt)
  tokenUtils.write(res, 'ec', { md5C: md5C })
  let ret = await email(req.body['email'], `您的邮箱验证码是：\n${captcha}`)
  if (ret) return res.sendStatus(hsc.ok)
  return res.sendStatus(hsc.internalSrvErr)
})

export default router
