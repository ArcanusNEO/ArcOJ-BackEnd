let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let lc = require('./midwares/login-check')
let db = require('../utils/database')

// 出于兼容目的保留
router.get('/', lc, (req, res) => {
  try {
    let tokenAcc = req.tokenAcc
    let account = {
      uid: tokenAcc['uid'],
      username: tokenAcc['username'].split('@', 1)[0],
      nickname: tokenAcc['nickname'],
      permission: tokenAcc['permission']
    }
    res.status(hsc.ok).json(account)
  } catch (err) {
    console.error(err)
    res.sendStatus(hsc.unauthorized)
  }
})

router.get('/id/:uid(\\d+)', lc,
  async (req, res) => {
    let query = 'SELECT "group"."title" AS "identity", "user"."nickname", "user"."qq", "user"."tel", "user"."realname", "user"."school", "user"."words" FROM "user" INNER JOIN "group" ON "user"."gid" = "group"."gid" WHERE "user"."uid" = $1 AND NOT "user"."removed"'
    let ret = (await db.query(query, [req.params.uid])).rows[0]
    if (ret) return res.status(hsc.ok).json(ret)
    else return res.sendStatus(hsc.notFound)
  })

module.exports = router
