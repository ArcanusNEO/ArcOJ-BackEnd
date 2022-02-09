let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let mc = require('./midwares/member-check')
let pc = require('./midwares/permission-check')
let tokenUtils = require('../utils/token')
let fc = require('./midwares/form-check')

router.get('/', async (req, res) => {
  let query = 'SELECT "problemset"."title" AS "name", "problemset"."description" AS "description", "private", "during", "course"."title" AS "courseName" FROM "problemset" LEFT JOIN "course" ON "problemset"."cid" = "course"."cid" WHERE "psid" = $1 AND "course"."visiable" = TRUE'
  let ret = (await db.query(query, [req.query.psid])).rows[0]
  if (ret) return res.status(hsc.ok).json(ret)
  else return res.sendStatus(hsc.unauthorized)
})

module.exports = router
