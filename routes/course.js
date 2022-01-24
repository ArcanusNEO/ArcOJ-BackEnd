let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let mc = require('./midwares/member-check')

router.get('/', lc, async (req, res) => {
  let uid = req.tokenAcc.uid
  let query = 'SELECT "course"."cid" AS "id", "title" AS "name" FROM "course_user" INNER JOIN "course" ON "course"."cid" = "course_user"."cid" WHERE "uid" = $1 AND "visiable" = TRUE ORDER BY "course"."cid" DESC'
  let ret = (await db.query(query, [uid])).rows
  return res.status(hsc.ok).json({ courses: ret })
})

router.get('/id/:cid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  async (req, res) => {
    let query = 'SELECT "tittle" AS "name", "teacher" AS "teachers", "number", "description", "semester" FROM "course" WHERE "cid" = $1 AND "visiable" = TRUE'
    let ret = (await db.query(query, req.params.cid)).rows[0]
    if (ret) return res.status(hsc.ok).json(ret)
    else return res.sendStatus(hsc.unauthorized)
  })

module.exports = router
