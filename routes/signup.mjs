import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import tokenUtils from '../utils/token.mjs'
import fc from './midwares/form-check.mjs'
import db from '../utils/database.mjs'
import md5 from '../utils/md5.mjs'
import salt from '../config/salt.mjs'
import smco from './midwares/strict-mode-check-obj.mjs'

router.use(smco.passcodeForbid)

router.post('/', fc(['body'], ['password', 'username', 'nickname'], hsc.parseErr, { ok: false }), async (req, res) => {
  try {
    let md5C = tokenUtils.get(req, 'ec')['md5C']
    tokenUtils.remove(res, 'ec')
    if (md5C !== md5(req.body['emailCaptcha'] + salt)) throw Error('Captcha is incorrect')
    let uid, username = req.body['username'], nickname = req.body['nickname'], password = req.body['password']
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
