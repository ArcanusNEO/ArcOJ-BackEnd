let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let mc = require('./midwares/member-check')
let pc = require('./midwares/permission-check')

router.get('/id/:sid(\\d+)', lc,
  async (req, res, next) => {
    if (parseInt(req.params.sid) > 0) return pc(req.tokenAcc.uid, ['getJudgeInfo'])(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res, next) => {
    let query = 'SELECT "solution"."sid", "solution"."uid", "solution"."pid", "problem"."psid", "solution"."status_id" AS "statusId", "solution"."lang_id" AS "langId", "solution"."code_size" AS "codeSize", "solution"."share", "solution"."run_time" AS "runTime", "solution"."run_memory" AS "runMemory", "solution"."when", "solution"."detail", "solution"."compile_info" AS "compileInfo", "solution"."score" FROM "solution" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" WHERE "sid" = $1'
    let ret = (await db.query(query, [req.params.sid])).rows[0]
    if (!ret) return res.sendStatus(hsc.forbidden)
    req.ann = ret
    return next()
  },
  async (req, res, next) => {
    if (!req.ann.psid) return next()
    return (mc['problemset'](req.tokenAcc.uid, req.ann.psid)(req, res, next))
  },
  async (req, res) => {

  }
)

module.exports = router