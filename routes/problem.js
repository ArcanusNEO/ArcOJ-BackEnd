let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let lc = require('./midwares/login-check')

router.get('/id/:pid(\\d+)', lc, async (req, res) => {
  let pid = req.params.pid
  let query = 'SELECT * FROM "problem" WHERE "pid" = $1 LIMIT 1'
  let ret = (await db.query(query, [pid])).rows[0]
  if (!ret) return res.sendStatus(hsc.notFound)
  return res.status(hsc.ok).json(ret)
})

module.exports = router
