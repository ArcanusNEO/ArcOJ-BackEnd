let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let mc = require('./midwares/member-check')

router.get('/', lc, async (req, res) => {
  let uid = req.tokenAcc.uid
  let query = `SELECT "problemset"."psid" AS "id", "title" AS "name" FROM "problemset_user" INNER JOIN "problemset" ON "problemset"."psid" = "problemset_user"."psid" WHERE "uid" = $1 AND "type" = 'assignment' ORDER BY "problemset"."psid" DESC`
  let ret = (await db.query(query, [uid])).rows
  return res.status(hsc.ok).json({ assignments: ret })
})

router.get('/id/:psid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  },
  async (req, res) => {
    let query = 'SELECT "problemset"."tittle" AS "name", "problemset"."description" AS "description", "private", "during", "course"."tittle" AS "courseName" FROM "problemset" LEFT JOIN "course" ON "problemset"."cid" = "course"."cid" WHERE "psid" = $1 AND "course"."visiable" = TRUE'
    let ret = (await db.query(query, req.params.psid)).rows[0]
    if (ret) return res.status(hsc.ok).json(ret)
    else return res.sendStatus(hsc.unauthorized)
  })

module.exports = router
