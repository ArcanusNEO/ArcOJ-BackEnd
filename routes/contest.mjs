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
  async (req, res) => {
    let psid = parseInt(req.params.psid)
    let query = 'SELECT "pid", "title" FROM "problem" WHERE "psid" = $1 ORDER BY "title" ASC'
    let meta = (await db.query(query, [psid])).rows
    if (!meta) return res.sendStatus(hsc.badReq)
    let firstTag = {}
    for (let each of meta) {
      firstTag[`${each.pid}`] = {}
      firstTag[`${each.pid}`].uid = null
      firstTag[`${each.pid}`].sid = null
      firstTag[`${each.pid}`].when = null
    }
    query = 'SELECT LOWER("problemset"."during")::TIMESTAMPTZ AS "begin", ("problemset"."secret_time" NOTNULL AND NOW()::TIMESTAMPTZ <@ "problemset"."secret_time") AS "secret" FROM "problemset" WHERE "problemset"."psid" = $1'
    let setInfo = (await db.query(query, [psid])).rows[0]
    let begin = new Date(setInfo.begin)
    let uid = req.tokenAcc.uid
    query = 'SELECT "problemset_user"."uid" AS "player", "user"."nickname" FROM "problemset_user" INNER JOIN "user" ON "problemset_user"."uid" = "user"."uid" WHERE "problemset_user"."psid" = $1 ORDER BY "problemset_user"."uid" ASC'
    let userInfo = (await db.query(query, [psid])).rows
    let tab = [], i = 0
    query = 'SELECT "solution"."sid", "solution"."uid", ("solution"."score" >= 100) AS "pass", "solution"."pid", "solution"."when", ("solution"."uid" <> $1 AND "problemset"."secret_time" NOTNULL AND "solution"."when" <@"problemset"."secret_time") AS "secret" FROM "solution" INNER JOIN "problem" ON "solution"."pid" = "problem"."pid" INNER JOIN "problemset" ON "problem"."psid" = "problemset"."psid" WHERE "problemset"."psid" = $2 AND "solution"."status_id" <> 100 AND "solution"."status_id" <> 101 AND "solution"."status_id" <> 120 AND "solution"."status_id" <> 121 AND ("problemset"."during" ISNULL OR "solution"."when" <@"problemset"."during") ORDER BY "solution"."uid" ASC, "problem"."title" ASC, "solution"."pid" ASC, "pass" DESC, "secret" ASC, "solution"."when" ASC'
    let ret = (await db.query(query, [uid, psid])).rows
    for (let { player, nickname } of userInfo) {
      let cur = {
        'uid': player,
        'nickname': nickname,
        'passCount': 0,
        'virtTime': 0,
        'detail': []
      }
      let curPass = false, passTime

      while (i < ret.length && ret[i].uid < player) ++i
      for (; i < ret.length && ret[i].uid === player; ++i) {
        let row = ret[i]
        let pass = (row.secret && setInfo.secret ? false : row.pass)
        if (cur.detail.length === 0 || cur.detail[cur.detail.length - 1].pid !== row.pid) {
          if (cur.detail.length !== 0 && curPass) 
            cur.virtTime += (20 * 60 * 1000) * cur.detail[cur.detail.length - 1].tryCount
          cur.detail.push({
            'pid': row.pid,
            'pass': pass,
            'sid': (pass ? row.sid : null),
            'when': (pass ? row.when : null),
            'elapse': (pass ? new Date(row.when) - begin : null),
            'tryCount': 0
          })
          curPass = pass
          if (pass) {
            cur.passCount += 1
            passTime = new Date(row.when)
            cur.virtTime += passTime - begin
            if (!firstTag[`${row.pid}`].when || new Date(firstTag[`${row.pid}`].when) > new Date(row.when)) {
              firstTag[`${row.pid}`].when = row.when
              firstTag[`${row.pid}`].uid = player
              firstTag[`${row.pid}`].sid = row.sid
            }
          }
        }
        if (!pass && (!curPass || new Date(row.when) <= passTime)) cur.detail[cur.detail.length - 1].tryCount += 1
      }
      if (cur.detail.length !== 0 && curPass) 
        cur.virtTime += (20 * 60 * 1000) * cur.detail[cur.detail.length - 1].tryCount
      tab.push(cur)
    }
    tab.sort((a, b) => {
      if (a.passCount !== b.passCount) return b.passCount - a.passCount
      if (a.virtTime !== b.virtTime) return a.virtTime - b.virtTime
      return a.uid - b.uid
    })
    for (let each of meta) {
      each.firstUser = firstTag[each.pid].uid || null
      each.firstSol = firstTag[each.pid].sid || null
      each.firstTime = firstTag[each.pid].when || null
    }
    return res.status(hsc.ok).json({ meta, tab })
  }
)

export default router
