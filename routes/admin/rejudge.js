const express = require('express')
const router = express.Router()
const hsc = require('../../config/http-status-code')
const lc = require('../midwares/login-check')
const db = require('../../utils/database')
const mtc = require('../midwares/maintainer-check')
const pc = require('../midwares/permission-check')
const { getSolutionStructure } = require('../../utils/judge')
const languageExtension = require('../../config/lang-ext')
const jsc = require('../../config/judge-status-code')
const fs = require('fs-extra')
const { judge } = require('../../utils/judge')

router.get('/sid/:sid(\\d+)', lc,
  async (req, res, next) => {
    let query = 'SELECT "solution"."lang_id" AS "langId", "solution"."pid", "problem"."psid", "problem"."special_judge" AS "specialJudge", "problem"."detail_judge" AS "detailJudge", "problem"."cases", "problem"."time_limit" AS "timeLimit", "problem"."memory_limit" AS "memoryLimit" FROM "solution" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" WHERE "solution"."sid" = $1'
    let sid = parseInt(req.params.sid)
    if (!(sid > 0)) return res.sendStatus(hsc.badReq)
    let ret = (await db.query(query, [sid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    let { pid, psid } = ret
    req.params.sid = sid
    req.params.pid = pid
    req.params.psid = psid
    req.params.ret = ret
    if (psid) return pc(req.tokenAcc.uid, ['rejudgeLocalProblem'])(req, res, next)
    return pc(req.tokenAcc.uid, ['rejudgeGlobalProblem'])(req, res, next)
  },
  async (req, res, next) => {
    if (req.params.psid) return mtc.problemset(req.tokenAcc.uid, req.params.psid)(req, res, next)
    return mtc.problem(req.tokenAcc.uid, req.params.pid)(req, res, next)
  },
  async (req, res) => {
    try {
      let { pid, sid, ret: def } = req.params
      let uid = req.tokenAcc.uid
      let struct = await getSolutionStructure(sid)
      let { cases, specialJudge, detailJudge, timeLimit, langId } = def
      let memoryLimit = parseInt(def.memoryLimit)
      let lang = languageExtension.idLang[langId]
      let langExt = languageExtension.idExt[langId]
      if (!langExt) throw Error('Unsupported language type')
      let code = await fs.readFile(`${struct.path.solution}/main.${langExt}`, 'utf8')
      let codeSize = Buffer.byteLength(code, 'utf8')
      let query = 'UPDATE "solution" SET "status_id" = $1, "code_size" = $2, "run_time" = $3, "run_memory" = $4, "score" = $5, "detail" = NULL, "compile_info" = NULL WHERE "sid" = $6'
      await db.query(query, [jsc.msgCode.RU, codeSize, 0, 0, 0, sid])
      if (judge({ sid, uid, pid, langId, langExt, lang, code, codeSize, cases, specialJudge, detailJudge, timeLimit, memoryLimit }))
        return res.sendStatus(hsc.ok)
    } catch (err) {
      console.error(err)
    }
    return res.sendStatus(hsc.unauthorized)
  }
)

module.exports = router