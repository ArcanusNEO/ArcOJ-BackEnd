const express = require('express')
const router = express.Router()
const hsc = require('../config/http-status-code')
const lc = require('./midwares/login-check')
const db = require('../utils/database')

router.get('/', lc, (req, res) => {
  try {
    let tokenAcc = req.tokenAcc
    let account = {
      uid: tokenAcc['uid'],
      username: tokenAcc['username'].split('@', 1)[0],
      nickname: tokenAcc['nickname'],
      permission: tokenAcc['permission']
    }
    return res.status(hsc.ok).json(account)
  } catch (err) {
    console.error(err)
    return res.sendStatus(hsc.unauthorized)
  }
})

router.get('/id/:uid(\\d+)', lc,
  async (req, res) => {
    let query = 'SELECT "group"."title" AS "identity", "user"."nickname", "user"."qq", "user"."tel", "user"."realname", "user"."school", "user"."words" FROM "user" INNER JOIN "group" ON "user"."gid" = "group"."gid" WHERE "user"."uid" = $1 AND NOT "user"."removed"'
    let ret = (await db.query(query, [req.params.uid])).rows[0]
    return res.status(hsc.ok).json(ret)
  })

module.exports = router
