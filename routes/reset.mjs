import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import fc from './midwares/form-check.mjs'
import tokenUtils from '../utils/token.mjs'
import db from '../utils/database.mjs'
import blake2 from '../utils/blake2.mjs'
import salt from '../config/salt.mjs'
import lc from './midwares/login-check.mjs'
import pc from './midwares/permission-check.mjs'
import permMap from '../config/permission-map.mjs'
import smco from './midwares/strict-mode-check-obj.mjs'

router.use(smco.passcodeForbid)

router.post('/password', fc(['body'], ['username', 'password']), async (req, res) => {
  try {
    let blake2C = tokenUtils.get(req, 'ec')['blake2C']
    tokenUtils.remove(res, 'ec')
    let username = req.body['username'], password = req.body['password']
    if (blake2C !== blake2(salt + username + blake2(req.body['emailCaptcha']))) throw Error('Captcha is incorrect')
    let sqlStr = 'SELECT "uid", "gid", "nickname" FROM "user" WHERE "email" = $1 AND NOT "removed" LIMIT 1'
    let sqlRes = await db.query(sqlStr, [username])
    if (!sqlRes.rows[0]) throw Error('No such user')
    let uid = sqlRes.rows[0]['uid'], permission = sqlRes.rows[0]['gid'], nickname = sqlRes.rows[0]['nickname']
    //权限映射
    permission = permMap[permission]
    sqlStr = 'UPDATE "user" SET "password" = $1 WHERE "uid" = $2'
    await db.query(sqlStr, [password, uid])
    let account = {
      uid: uid,
      username: username,
      nickname: nickname,
      permission: permission
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

router.post('/profile', lc,
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, ['changeProfile'])(req, res, next)
  },
  (req, res, next) => {
    let options = ['nickname', 'qq', 'tel', 'realname', 'school', 'words']
    let items = []
    for (let key of options)
      if (req.body[key]) items.push(key)
    req.items = items
    return fc(['body'], items)(req, res, next)
  },
  async (req, res) => {
    let query = 'SELECT "removed" FROM "user" WHERE "uid" = $1'
    let ret = (await db.query(query, [req.tokenAcc.uid])).rows[0]
    if (!ret || ret.removed) return res.sendStatus(hsc.forbidden)
    query = 'UPDATE "user" SET "removed" = FALSE'
    let param = []
    for (let key of req.items)
      query += `, "${key}" = $${param.push(req.body[key])}`
    query += ` WHERE "uid" = $${param.push(req.tokenAcc.uid)} RETURNING "nickname", "qq", "tel", "realname", "school", "words"`
    try {
      ret = (await db.query(query, param)).rows[0]
    } catch (err) {
      console.error(err)
      return res.sendStatus(hsc.forbidden)
    }
    if (!ret) return res.sendStatus(hsc.forbidden)
    if (req.items.indexOf('nickname') !== -1) {
      let account = {
        uid: req.tokenAcc.uid,
        username: req.tokenAcc.username,
        nickname: ret.nickname,
        permission: req.tokenAcc.permission
      }
      tokenUtils.write(res, 'acc', account)
    }
    return res.status(hsc.ok).json(ret)
  })

export default router
