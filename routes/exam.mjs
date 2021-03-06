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
  get('exam'))
router.get('/open', lc,
  async (req, res, next) => {
    req.params.cid = 0
    return next()
  },
  getOpen('exam'))
router.get('/global', lc, get('exam'))
router.get('/global/open', lc, getOpen('exam'))
router.get('/course(s)?/:cid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  get('exam'))
router.get('/course(s)?/:cid(\\d+)/open', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  getOpen('exam'))

router.get('/id/:psid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  }, getDetail)

router.get('/id/:psid(\\d+)/rank', lc,
  async (req, res) => {
    let psid = parseInt(req.params.psid)
    let query = `SELECT COUNT(*) FROM "problemset" WHERE "psid" = $1 AND "type" <> 'contest'`
    let ret = (await db.query(query, [psid])).rows[0]
    if (!ret || !parseInt(ret.count)) return res.sendStatus(hsc.forbidden)
    query = 'SELECT "pid", "title" FROM "problem" WHERE "psid" = $1 ORDER BY "title" ASC'
    let meta = (await db.query(query, [psid])).rows
    if (!meta) return res.sendStatus(hsc.badReq)
    query = 'SELECT DISTINCT ON ("solution"."uid", "problem"."title") "solution"."sid", "solution"."score", ("solution"."score" >= 100) AS "pass", "solution"."uid", "user"."nickname", "solution"."pid", "solution"."run_time" AS "runTime", "solution"."run_memory" AS "runMemory", "solution"."when" FROM "solution" INNER JOIN "user" ON "solution"."uid" = "user"."uid" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" INNER JOIN "problemset" ON "problem"."psid" = "problemset"."psid" WHERE "problem"."psid" = $1 AND "solution"."when" <@ "problemset"."during" AND ("problemset"."secret_time" ISNULL OR NOT "solution"."when" <@ "problemset"."secret_time") ORDER BY "solution"."uid" ASC, "problem"."title" ASC, "solution"."pid" ASC, "solution"."score" DESC, "solution"."run_time" ASC, "solution"."run_memory" ASC, "solution"."when" ASC'
    ret = (await db.query(query, [psid])).rows
    let tab = []
    for (let row of ret) {
      if (tab.length === 0 || row.uid !== tab[tab.length - 1].uid)
        tab.push({
          'uid': row.uid,
          'nickname': row.nickname,
          'totScore': 0,
          'totTime': 0,
          'totMem': 0,
          'lastPassTime': new Date('2000-01-01 00:00:00+00'),
          'detail': []
        })
      let urow = tab[tab.length - 1]
      urow.totScore += row.score
      urow.totTime += row.runTime
      urow.totMem += row.runMemory
      urow.lastPassTime = (new Date(row.when) > urow.lastPassTime ? row.when : urow.lastPassTime)
      urow.detail.push({
        'pid': row.pid,
        'score': row.score,
        'pass': row.pass,
        'sid': row.sid,
        'time': row.runTime,
        'memory': row.runMemory,
        'when': row.when
      })
    }
    tab.sort((a, b) => {
      if (a.totScore !== b.totScore) return b.totScore - a.totScore
      if (a.totTime !== b.totTime) return a.totTime - b.totTime
      if (a.totMem !== b.totMem) return a.totMem - b.totMem
      if (a.lastPassTime === b.lastPassTime) return a.uid - b.uid
      return (a.lastPassTime < b.lastPassTime ? -1 : 1)
    })
    return res.status(hsc.ok).json({ meta, tab })
  }
)

export default router
