import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import fc from './midwares/form-check.mjs'
import sr from 'string-random'
import tokenUtils from '../utils/token.mjs'
import email from '../utils/email.mjs'
import blake2 from '../utils/blake2.mjs'
import salt from '../config/salt.mjs'
import smco from './midwares/strict-mode-check-obj.mjs'

router.use(smco.passcodeForbid)

router.post('/', fc(['body'], ['email']), async (req, res) => {
  let username = req.body['email']
  let captcha = sr(5)
  let blake2C = blake2(salt + username + blake2(captcha))
  tokenUtils.write(res, 'ec', { blake2C: blake2C })
  let ret = await email(username, `您的邮箱验证码是：\n${captcha}`)
  if (ret) return res.sendStatus(hsc.ok)
  return res.sendStatus(hsc.internalSrvErr)
})

export default router
