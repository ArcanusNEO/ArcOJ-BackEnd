import problem from './problemset.mjs'
const { get, getOpen, getDetail } = problem
import express from 'express'
const router = express.Router()
import lc from './midwares/login-check.mjs'
import mc from './midwares/member-check.mjs'
import db from '../utils/database.mjs'
import hsc from '../config/http-status-code.mjs'

router.get('/', lc,
  async (req, res, next) => {
    req.params.cid = 0
    return next()
  },
  get('contest'))
router.get('/open', lc,
  async (req, res, next) => {
    req.params.cid = 0
    return next()
  },
  getOpen('contest'))
router.get('/global', lc, get('contest'))
router.get('/global/open', lc, getOpen('contest'))
router.get('/course(s)?/:cid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  get('contest'))
router.get('/course(s)?/:cid(\\d+)/open', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  getOpen('contest'))

router.get('/id/:psid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  }, getDetail)

router.get('/id/:psid(\\d+)/rank', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  },
  async (req, res) => {
    let psid = parseInt(req.params.psid)
    let query = 'SELECT "pid", "title" FROM "problem" WHERE "psid" = $1 ORDER BY "title" ASC'
    let meta = (await db.query(query, [psid])).rows
    query = 'SELECT LOWER("problemset"."during")::TIMESTAMPTZ AS "begin", ("problemset"."secret_time" NOTNULL AND NOW()::TIMESTAMPTZ <@ "problemset"."secret_time") AS "secret" FROM "problemset" WHERE "problemset"."psid" = $1'
    let setInfo = (await db.query(query, [psid])).rows[0]
    let begin = new Date(setInfo.begin)
    if (setInfo.secret) query = 'SELECT DISTINCT ON ("solution"."uid", "problem"."title") "solution"."sid", ("solution"."score" >= 100) AS "pass", "solution"."uid", "user"."nickname", "solution"."pid", "solution"."when", (SELECT COUNT(*) FROM "solution" AS "inner_sol" WHERE "inner_sol"."uid" = "solution"."uid" AND "solution"."pid" = "inner_sol"."pid" AND "inner_sol"."when" < "solution"."when" AND ("problemset"."secret_time" ISNULL OR NOT "inner_sol"."when" <@ "problemset"."secret_time")) AS "tryCount" FROM "solution" INNER JOIN "user" ON "solution"."uid" = "user"."uid" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" INNER JOIN "problemset" ON "problem"."psid" = "problemset"."psid" WHERE "problem"."psid" = $1 AND "solution"."when" <@ "problemset"."during" AND ("problemset"."secret_time" ISNULL OR NOT "solution"."when" <@ "problemset"."secret_time") ORDER BY "solution"."uid" ASC, "problem"."title" ASC, "solution"."score" DESC, "solution"."when" ASC'
    else query = 'SELECT DISTINCT ON ("solution"."uid", "problem"."title") "solution"."sid", ("solution"."score" >= 100) AS "pass", "solution"."uid", "user"."nickname", "solution"."pid", "solution"."when", (SELECT COUNT(*) FROM "solution" AS "inner_sol" WHERE "inner_sol"."uid" = "solution"."uid" AND "solution"."pid" = "inner_sol"."pid" AND "inner_sol"."when" < "solution"."when") AS "tryCount" FROM "solution" INNER JOIN "user" ON "solution"."uid" = "user"."uid" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" INNER JOIN "problemset" ON "problem"."psid" = "problemset"."psid" WHERE "problem"."psid" = $1 AND "solution"."when" <@ "problemset"."during" ORDER BY "solution"."uid" ASC, "problem"."title" ASC, "solution"."score" DESC, "solution"."when" ASC'
    let ret = (await db.query(query, [psid])).rows
    let tab = []
    for (let row of ret) {
      if (tab.length === 0 || row.uid !== tab[tab.length - 1].uid)
        tab.push({
          'uid': row.uid,
          'nickname': row.nickname,
          'passCount': 0,
          'failCount': 0,
          'virtTime': 0,
          'detail': []
        })
      let urow = tab[tab.length - 1]
      if (row.pass) {
        urow.passCount += 1
        urow.failCount += row.tryCount
        urow.virtTime += new Date(row.when) - begin + (20 * 60 * 1000) * row.tryCount
      }
      urow.detail.push({
        'pid': row.pid,
        'pass': row.pass,
        'sid': row.sid,
        'when': row.when,
        'tryCount': row.tryCount + (row.pass ? 0 : 1)
      })
    }
    tab.sort((a, b) => {
      if (a.passCount !== b.passCount) return b.passCount - a.passCount
      if (a.virtTime !== b.virtTime) return a.virtTime - b.virtTime
      return a.uid - b.uid
    })
    return res.status(hsc.ok).json({ meta, tab })
  }
)

export default router
