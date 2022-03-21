const express = require('express')
const router = express.Router()
const hsc = require('../config/http-status-code')
const db = require('../utils/database')
const lc = require('./midwares/login-check')
const pc = require('./midwares/permission-check')
const jsc = require('../config/judge-status-code')
const { getSolutionStructure } = require('../utils/judge')
const languageExtension = require('../config/lang-ext')
const fs = require('fs-extra')

router.get('/id/:sid(\\d+)', lc,
  async (req, res, next) => {
    if (parseInt(req.params.sid) > 0) return pc(req.tokenAcc.uid, ['getJudgeInfo'])(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res) => {
    let uid = req.tokenAcc.uid, sid = req.params.sid, permission = req.tokenAcc.permission
    let query = `SELECT "solution"."sid", "solution"."uid", "solution"."pid", "solution"."status_id" AS "statusId", "solution"."lang_id" AS "langId", "solution"."code_size" AS "codeSize", "solution"."share", "solution"."run_time" AS "runTime", "solution"."run_memory" AS "runMemory", "solution"."when", "solution"."detail", "solution"."compile_info" AS "compileInfo", "solution"."score", "problem"."title" AS "name", "user"."nickname", ("solution"."uid" <> $1 AND "problemset"."secret_time" NOTNULL AND NOW()::TIMESTAMPTZ <@ "problemset"."secret_time") AS "secret", ("solution"."uid" <> $1 AND NOW()::TIMESTAMPTZ <@ "problemset"."during") AS "open", ("solution"."uid" <> $1 AND NOW()::TIMESTAMPTZ < LOWER("problemset"."during")) AS "before" FROM "solution" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" INNER JOIN "user" ON "solution"."uid" = "user"."uid" LEFT JOIN "problemset" ON "problem"."psid" = "problemset"."psid" WHERE "sid" = $2`
    let ret = (await db.query(query, [uid, sid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    let struct = await getSolutionStructure(sid)
    let fileCode = struct.file.codeBase + languageExtension.idExt[ret.langId]
    let code = await fs.readFile(fileCode, 'utf8')
    ret.code = code
    let { secret, before, open } = ret
    delete ret.secret
    delete ret.before
    delete ret.open
    if (ret.uid === uid || permission >= 1) return res.status(hsc.ok).json(ret)
    let blockList = []
    if (before || !ret.share || open || secret) {
      blockList.push('code', 'detail', 'compileInfo', 'codeSize')
      if (before || secret) blockList.push('runTime', 'runMemory', 'score')
    }
    for (let key of blockList)
      ret[key] = null
    if (secret) ret.statusId = jsc.msgCode.HD
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
    let status = (ret.hide && req.tokenAcc.permission < 1 ? jsc.msgCode.HD : ret.statusId)
    return res.status(hsc.ok).json(status)
  }
)

router.get('/total', lc, async (req, res) => {
  let query = 'SELECT COUNT(*) FROM "solution" WHERE TRUE'
  let queryUid = parseInt(req.query.uid), queryPid = parseInt(req.query.pid)
  let param = []
  if (queryUid > 0) query += ` AND "solution"."uid" = $${param.push(queryUid)}`
  if (queryPid > 0) query += ` AND "solution"."pid" = $${param.push(queryPid)}`
  let ret = (await db.query(query, param)).rows[0]
  let total = parseInt(ret.count)
  return res.status(hsc.ok).json(total)
})

router.get('/', lc,
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, ['getJudgeInfo'])(req, res, next)
  },
  async (req, res) => {
    let query = 'SELECT "solution"."sid", "solution"."uid", "solution"."pid", "solution"."status_id" AS "statusId", "problem"."title" AS "name", "user"."nickname", ("solution"."uid" <> $1 AND "problemset"."secret_time" NOTNULL AND NOW()::TIMESTAMPTZ <@ "problemset"."secret_time") AS "hide" FROM "solution" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" INNER JOIN "user" ON "solution"."uid" = "user"."uid" LEFT JOIN "problemset" ON "problem"."psid" = "problemset"."psid" WHERE TRUE'
    let queryUid = parseInt(req.query.uid), queryPid = parseInt(req.query.pid)
    let queryNick = '%' + req.query.nickname + '%'
    let param = [req.tokenAcc.uid]
    if (queryUid > 0) query += ` AND "solution"."uid" = $${param.push(queryUid)}`
    if (queryPid > 0) query += ` AND "solution"."pid" = $${param.push(queryPid)}`
    if (queryNick) query += ` AND "user"."nickname" LIKE $${param.push(queryNick)}`
    query += ' ORDER BY "sid" DESC'
    let page = parseInt(req.query.page), item = parseInt(req.query.item)
    let limit = item, offset = (page - 1) * item
    if (limit > 0) {
      query += ` LIMIT $${param.push(limit)}`
      if (offset >= 0) query += ` OFFSET $${param.push(offset)}`
    }
    let ret = (await db.query(query, param)).rows
    for (let each of ret) {
      if (each.hide && req.tokenAcc.permission < 1) each.statusId = jsc.msgCode.HD
      delete each.hide
    }
    return res.status(hsc.ok).json(ret)
  }
)

module.exports = router