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
  async (req, res) => {
    let query = 'SELECT "solution"."sid", "solution"."uid", "solution"."pid", "solution"."status_id" AS "statusId", "solution"."lang_id" AS "langId", "solution"."code_size" AS "codeSize", "solution"."share", "solution"."run_time" AS "runTime", "solution"."run_memory" AS "runMemory", "solution"."when", "solution"."detail", "solution"."compile_info" AS "compileInfo", "solution"."score" FROM "solution" WHERE "sid" = $1'
    let ret = (await db.query(query, [req.params.sid])).rows[0]
    return res.status(hsc.ok).json(ret)
  }
)

router.get('/total', lc,
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, ['getJudgeInfo'])(req, res, next)
  },
  async (req, res) => {
    let query = 'SELECT COUNT(*) FROM "solution" WHERE "uid" = $1'
    let ret = (await db.query(query, [req.tokenAcc.uid])).rows[0]
    let total = ret.count
    return res.status(hsc.ok).json(total)
  }
)

router.get('/', lc,
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, ['getJudgeInfo'])(req, res, next)
  },
  async (req, res) => {
    let query = 'SELECT "sid", "uid", "pid", "status_id" AS "statusId", "lang_id" AS "langId", "code_size" AS "codeSize", "share", "run_time" AS "runTime", "run_memory" AS "runMemory", "when", "detail", "compile_info" AS "compileInfo", "score" FROM "solution" WHERE "uid" = $1 ORDER BY "sid" DESC'
    let param = [req.tokenAcc.uid]
    let { page, item } = req.query
    page = parseInt(page)
    item = parseInt(item)
    if (limit > 0) {
      query += ` LIMIT $${param.push(limit)}`
      if (offset >= 0) query += ` OFFSET $${param.push(offset)}`
    }
    let ret = (await db.query(query, param)).rows
    return res.status(hsc.ok).json(ret)
  }
)

module.exports = router