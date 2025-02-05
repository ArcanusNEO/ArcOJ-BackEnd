import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import tokenUtils from '../utils/token.mjs'
import fc from './midwares/form-check.mjs'
import db from '../utils/database.mjs'
import blake2 from '../utils/blake2.mjs'
import salt from '../config/salt.mjs'
import smco from './midwares/strict-mode-check-obj.mjs'

router.use(smco.passcodeForbid)

router.post('/', fc(['body'], ['password', 'username', 'nickname'], hsc.parseErr, { ok: false }), async (req, res) => {
  try {
    let blake2C = tokenUtils.get(req, 'ec')['blake2C']
    tokenUtils.remove(res, 'ec')
    let username = req.body['username']
    if (blake2C !== blake2(salt + username + blake2(req.body['emailCaptcha']))) throw Error('Captcha is incorrect')
    let uid, nickname = req.body['nickname'], password = req.body['password']
    let sqlStr = 'SELECT "uid" FROM "user" WHERE "email" = $1 LIMIT 1'
    let tot = await db.query(sqlStr, [username])
    if (tot.rows[0]) return res.status(hsc.resOccupied).json({ ok: false })
    sqlStr = 'INSERT INTO "user" ("gid", "nickname", "email", "password", "signup_time") VALUES (3, $1, $2, $3, NOW()::TIMESTAMPTZ) RETURNING "uid"'
    let sqlRes = await db.query(sqlStr, [nickname, username, password])
    uid = sqlRes.rows[0]['uid']
    let account = {
      uid: uid,
      username: username,
      nickname: nickname,
      permission: 0
    }
    tokenUtils.write(res, 'acc', account)
    return res.status(hsc.ok).json({
      ok: true,
      userData: account
    })
  } catch (err) {
    console.error(err)
    return res.status(hsc.captchaMismatch).json({ ok: false })
  }
})

export default router
