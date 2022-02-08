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
  let { uid, gid, nickname, email, qq, tel, realname, school, words, limit } = req.query
  let queryStr = 'SELECT * FROM "user" INNER JOIN "group" ON "user"."gid" = "group"."gid" WHERE NOT "user"."removed"'
  let allParams = { uid, gid, nickname, email, qq, tel, realname, school, words }
  let param = []
  for (let key in allParams) {
    if (!allParams[key]) continue
    console.log(allParams[key])
    queryStr += ` AND "user"."${key}" = $${param.push(allParams[key])}`
  }
  if (parseInt(limit) > 0) queryStr += ` LIMIT $${param.push(parseInt(limit))}`
  let ret = (await db.query(queryStr, param)).rows
  return res.status(hsc.ok).json(ret)
})

module.exports = router
