let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let pc = require('./midwares/permission-check')
let jsc = require('../config/judge-status-code')
let { getSolutionStructure } = require('../utils/judge')
let languageExtension = require('../config/lang-ext')
let fs = require('fs-extra')

router.get('/id/:sid(\\d+)', lc,
  async (req, res, next) => {
    if (parseInt(req.params.sid) > 0) return pc(req.tokenAcc.uid, ['getJudgeInfo'])(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res) => {
    let uid = req.tokenAcc.uid, sid = req.params.sid, permission = req.tokenAcc.permission
    let query = 'SELECT "solution"."sid", "solution"."uid", "solution"."pid", "solution"."status_id" AS "statusId", "solution"."lang_id" AS "langId", "solution"."code_size" AS "codeSize", "solution"."share", "solution"."run_time" AS "runTime", "solution"."run_memory" AS "runMemory", "solution"."when", "solution"."detail", "solution"."compile_info" AS "compileInfo", "solution"."score", "problem"."title" AS "name", ("solution"."uid" <> $1 AND "problemset"."secret_time" NOTNULL AND NOW()::TIMESTAMPTZ <@ "problemset"."secret_time") AS "secret", ("solution"."uid" <> $2 AND NOW()::TIMESTAMPTZ <@ "problemset"."during") AS "open" FROM "solution" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" LEFT JOIN "problemset" ON "problem"."psid" = "problemset"."psid" WHERE "sid" = $3'
    let ret = (await db.query(query, [uid, uid, sid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    if (permission === 2 || !ret.open) {
      let struct = await getSolutionStructure(sid)
      let fileCode = struct.file.codeBase + languageExtension.idExt[ret.langId]
      let code = await fs.readFile(fileCode, 'utf8')
      ret.code = code
      delete ret.secret
      delete ret.open
      return res.status(hsc.ok).json(ret)
    }
    return res.status(hsc.ok).json(ret)
  }
)

router.get('/id/:sid(\\d+)/status', lc,
  async (req, res, next) => {
    if (parseInt(req.params.sid) > 0) return pc(req.tokenAcc.uid, ['getJudgeInfo'])(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res) => {
    let query = 'SELECT "solution"."status_id" AS "statusId", ("solution"."uid" <> $1 AND "problemset"."secret_time" NOTNULL AND NOW()::TIMESTAMPTZ <@ "problemset"."secret_time") AS "hide" FROM "solution" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" LEFT JOIN "problemset" ON "problem"."psid" = "problemset"."psid" WHERE "sid" = $2'
    let ret = (await db.query(query, [req.tokenAcc.uid, req.params.sid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    let status = (ret.hide || req.tokenAcc.permission === 2 ? jsc.msgCode.HD : ret.statusId)
    return res.status(hsc.ok).json(status)
  }
)

router.get('/total', lc, async (req, res) => {
  let query = 'SELECT COUNT(*) FROM "solution"'
  let ret = (await db.query(query)).rows[0]
  let total = parseInt(ret.count)
  return res.status(hsc.ok).json(total)
})

router.get('/', lc,
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, ['getJudgeInfo'])(req, res, next)
  },
  async (req, res) => {
    let query = 'SELECT "solution"."sid", "problem"."pid", "solution"."status_id" AS "statusId", "problem"."title" AS "name", ("solution"."uid" <> $1 AND "problemset"."secret_time" NOTNULL AND NOW()::TIMESTAMPTZ <@ "problemset"."secret_time") AS "hide" FROM "solution" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" LEFT JOIN "problemset" ON "problem"."psid" = "problemset"."psid" ORDER BY "sid" DESC'
    let param = [req.tokenAcc.uid]
    let page = parseInt(req.query.page), item = parseInt(req.query.item)
    let limit = item, offset = (page - 1) * item
    if (limit > 0) {
      query += ` LIMIT $${param.push(limit)}`
      if (offset >= 0) query += ` OFFSET $${param.push(offset)}`
    }
    let ret = (await db.query(query, param)).rows
    for (let each of ret) {
      if (each.hide && req.tokenAcc.permission !== 2) each.statusId = jsc.msgCode.HD
      delete each.hide
    }
    return res.status(hsc.ok).json(ret)
  }
)

module.exports = router