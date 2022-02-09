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
  let uid = 3, ret = {}
  let cid = parseInt(req.query.cid)
  let param = []
  let property = 'assignment'
  let query = `SELECT "problemset"."psid" AS "id", "title" AS "name" FROM "problemset_user" INNER JOIN "problemset" ON "problemset"."psid" = "problemset_user"."psid" WHERE "uid" = $${param.push(uid)} AND "type" = '${property}'`
  if (cid > 0) query += ` AND "cid" = $${param.push(cid)}`
  query += ' ORDER BY "problemset"."psid" DESC'
  ret[property] = (await db.query(query, param)).rows
  return res.status(hsc.ok).json(ret)
})

module.exports = router
