let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let fc = require('./midwares/form-check')
let tokenUtils = require('../utils/token')
let db = require('../utils/database')
let md5 = require('../utils/md5')
let salt = require('../config/salt')
let lc = require('./midwares/login-check')
let pc = require('./midwares/permission-check')

router.post('/password', fc(['body'], ['username', 'password']), async (req, res) => {
  try {
    let md5C = tokenUtils.get(req, 'ec')['md5C']
    tokenUtils.remove(res, 'ec')
    if (md5C !== md5(req.body['emailCaptcha'] + salt)) throw Error('Captcha is incorrect')
    let username = req.body['username'], password = req.body['password']
    let sqlStr = 'SELECT "uid", "gid", "nickname" FROM "user" WHERE "email" = $1 AND NOT "removed" LIMIT 1'
    let sqlRes = await db.query(sqlStr, [username])
    if (!sqlRes.rows[0]) throw Error('No such user')
    let uid = sqlRes.rows[0]['uid'], permission = sqlRes.rows[0]['gid'], nickname = sqlRes.rows[0]['nickname']
    //权限映射
    let permMap = [-1, 2, 1, 0]
    permission = permMap[permission]
    sqlStr = 'UPDATE "user" SET "password" = "hash_password"($1) WHERE "uid" = $2'
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
    return pc(req.tokenAcc.uid, 'changeProfile')(req, res, next)
  },
  (req, res, next) => {
    let options = ['nickname', 'qq', 'tel', 'realname', 'school', 'words']
    let items = []
    for (let key in options)
      if (req.body[key]) items.push(key)
    req.items = items
    return fc(['body'], items)(req, res, next)
  },
  async (req, res) => {
    let query = 'SELECT * FROM "problem" WHERE "pid" = $1 LIMIT 1'
    for (let key in req.items) {

    }
    let ret = (await db.query(query, [pid])).rows[0]
    if (!ret) return res.sendStatus(hsc.notFound)
    return res.status(hsc.ok).json(ret)
  })

module.exports = router
