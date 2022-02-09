let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let tokenUtils = require('../utils/token')
let fc = require('./midwares/form-check')
let db = require('../utils/database')

router.post('/', fc(['body'], ['username', 'password'], hsc.parseErr, { ok: false }), async (req, res) => {
  try {
    //如果已经登录就不查数据库
    let account = tokenUtils.get(req, 'acc')
    if (account.username !== req.body.username) throw Error('Token mismatch')
    return res.status(hsc.ok).json({
      ok: true,
      userData: account
    })
  } catch (err) {
    tokenUtils.remove(res, 'acc')
    //访问数据库验证密码并获取用户信息
    let sqlStr = 'SELECT "uid", "gid", "nickname" FROM "user" WHERE "email" = $1 AND "password" = "hash_password"($2) AND NOT "removed" LIMIT 1'
    let username = req.body.username, password = req.body.password
    let dbRes = await db.query(sqlStr, [username, password])
    if (!dbRes.rows[0]) return res.status(hsc.passwdMismatch).json({ ok: false })
    let uid = dbRes.rows[0]['uid'], nickname = dbRes.rows[0]['nickname'], permission = dbRes.rows[0]['gid']
    //权限映射
    let permMap = [-1, 2, 1, 0]
    permission = permMap[permission]
    let account = {
      uid: uid,
      username: username,
      nickname: nickname,
      permission: permission
    }
    //写入cookie
    tokenUtils.write(res, 'acc', account)
    return res.status(hsc.ok).json({
      ok: true,
      userData: account
    })
  }
})

module.exports = router
