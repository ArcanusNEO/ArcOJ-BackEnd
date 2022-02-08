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
  let query = 'SELECT * FROM "user" WHERE "uid" = 1'
  let ret = (await db.query(query, req.params.uid)).rows[0]
  if (ret) return res.status(hsc.ok).json(ret)
  else return res.sendStatus(hsc.notFound)
})

module.exports = router
