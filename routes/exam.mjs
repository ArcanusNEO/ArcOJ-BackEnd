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
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  },
  async (req, res) => {
    let psid = parseInt(req.params.psid)
    let query = 'SELECT "pid", "title" FROM "problem" WHERE "psid" = $1 ORDER BY "title" ASC'
    let meta = (await db.query(query, [psid])).rows
    query = 'SELECT DISTINCT ON ("solution"."uid", "problem"."title") "solution"."sid", "solution"."score", "solution"."uid", "user"."nickname", "solution"."pid", "solution"."when" FROM "solution" INNER JOIN "user" ON "solution"."uid" = "user"."uid" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" INNER JOIN "problemset" ON "problem"."psid" = "problemset"."psid" WHERE "problem"."psid" = $1 AND "solution"."when" <@ "problemset"."during" AND ("problemset"."secret_time" ISNULL OR NOT "solution"."when" <@ "problemset"."secret_time") ORDER BY "solution"."uid" ASC, "problem"."title" ASC, "solution"."score" DESC'
    let ret = (await db.query(query, [psid])).rows
    let tab = []
    for (let row of ret) {
      if (tab.length === 0 || row.uid !== tab[tab.length - 1].uid)
        tab.push({
          'uid': row.uid,
          'nickname': row.nickname,
          'totScore': 0,
          'detail': []
        })
      let urow = tab[tab.length - 1]
      urow.totScore += row.score
      urow.detail.push({
        'pid': row.pid,
        'score': row.score,
        'sid': row.sid,
        'when': row.when
      })
    }
    return res.status(hsc.ok).json({ meta, tab })
  }
)

export default router
