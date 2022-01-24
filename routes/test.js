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
  let sqlStr = 'SELECT "during" FROM "problemset" WHERE "psid" = $1 AND NOW()::TIMESTAMP <@ "during" LIMIT 1'
  let ret = (await db.query(sqlStr, [1])).rows[0]
  if (ret) res.status(hsc.ok).json({ now: Date.now(), during: ret['during'] })
  else res.sendStatus(hsc.forbidden)
  // hello
})

module.exports = router
