let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let pc = require('./midwares/permission-check')
let languageExtension = require('../config/lang-ext')
let jsc = require('../config/judge-status-code')
let { judge } = require('../utils/judge')

router.post('/', lc,
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, ['submitCode'])(req, res, next)
  },
  async (req, res) => {
    let { pid, lang, code, share } = req.body
    let uid = req.tokenAcc.uid
    let sqlStr = 'SELECT * FROM "problem" WHERE "pid" = $1 LIMIT 1'
    let ret = (await db.query(sqlStr, [pid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    let { psid, cases } = ret
    let specialJudge = ret['special_judge'], detailJudge = ret['detail_judge'], timeLimit = ret['time_limit'], memoryLimit = ret['memory_limit']
    if (psid) {
      // 属于某个问题集，检查权限
      sqlStr = 'SELECT "during" FROM "problemset" INNER JOIN "problemset_user" ON "problemset"."psid" = "problemset_user"."psid" WHERE "problemset"."psid" = $1 AND NOW()::TIMESTAMPTZ <@ "problemset"."during" AND "problemset_user"."uid" = $2 LIMIT 1'
      let pbret = (await db.query(sqlStr, [psid, uid])).rows[0]
      if (!pbret) res.sendStatus(hsc.forbidden)
    }
    // 不属于问题集或者检查完权限，开测
    try {
      let langExt = languageExtension.langExt[lang]
      let langId = languageExtension.langId[langExt]
      let codeSize = Buffer.byteLength(code, 'utf8')
      sqlStr = 'INSERT INTO "solution" ("uid", "pid", "status_id", "lang_id", "code_size", "share", "run_time", "run_memory", "when", "score") VALUES($1, $2, $3, $4, $5, $6, $7, $8, NOW()::TIMESTAMPTZ, $9) RETURNING sid'
      ret = (await db.query(sqlStr, [uid, pid, jsc.msgCode.RU, langId, codeSize, share, 0, 0, 0])).rows[0]
      let sid = ret['sid']
      if (sid) res.status(hsc.ok).json({ sid })
      else throw Error('Failed to get solution id')
      return judge({ sid, uid, pid, psid, langId, langExt, lang, code, codeSize, cases, specialJudge, detailJudge, timeLimit, memoryLimit })
    } catch (err) {
      console.error(err)
      return res.sendStatus(hsc.unsupportedType)
    }
  })

module.exports = router
