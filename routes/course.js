const express = require('express')
const router = express.Router()
const hsc = require('../config/http-status-code')
const db = require('../utils/database')
const lc = require('./midwares/login-check')
const mc = require('./midwares/member-check')

router.get('/', lc, async (req, res) => {
  let uid = req.tokenAcc.uid
  let query = 'SELECT "course"."cid" AS "id", "title" AS "name" FROM "course_user" INNER JOIN "course" ON "course"."cid" = "course_user"."cid" WHERE "uid" = $1 AND "visiable" ORDER BY "course"."cid" DESC'
  let ret = (await db.query(query, [uid])).rows
  return res.status(hsc.ok).json(ret)
})

router.get('/id/:cid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  async (req, res) => {
    let query = 'SELECT "title" AS "name", "teacher" AS "teachers", "number", "description", "semester" FROM "course" WHERE "cid" = $1 AND "visiable"'
    let ret = (await db.query(query, [req.params.cid])).rows[0]
    if (ret) return res.status(hsc.ok).json(ret)
    return res.sendStatus(hsc.unauthorized)
  })

module.exports = router
