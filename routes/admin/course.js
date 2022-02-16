const express = require('express')
const router = express.Router()
const hsc = require('../../config/http-status-code')
const lc = require('../midwares/login-check')
const pc = require('../midwares/permission-check')
const db = require('../../utils/database')

router.get('/', lc,
  async (req, res, next) => {
    return (pc(req.tokenAcc.uid, ['editCourse'])(req, res, next))
  },
  async (req, res) => {
    let query = 'SELECT "course"."title" AS "name", "course"."cid" AS "id" FROM "course" INNER JOIN "course_maintainer" ON "course"."cid" = "course_maintainer"."cid" WHERE "course_maintainer"."uid" = $1 ORDER BY "course"."cid" DESC'
    let ret = (await db.query(query, [req.tokenAcc.uid])).rows
    res.status(hsc.ok).json(ret)
  })

module.exports = router
