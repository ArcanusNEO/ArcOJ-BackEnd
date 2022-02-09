let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let mc = require('./midwares/member-check')

router.get('/id/:id(\\d+)', lc,
  async (req, res, next) => {
    let mid = req.params.id
    let query = 'SELECT "cid", "psid", "mid" AS "id", "title", "content", "when" AS "time" FROM "message" WHERE NOT "from_del" AND "to" IS NULL AND "mid" = $1'
    let ret = (await db.query(query, [mid])).rows[0]
    if (ret) {
      req.ann = ret
      return next()
    } else return res.sendStatus(hsc.notFound)
  },
  async (req, res, next) => {
    if (ret.ann.cid) return (mc['course'](req.tokenAcc.uid, ret.ann.cid)(req, res, next))
    else if (ret.ann.psid) return (mc['problemset'](req.tokenAcc.uid, ret.ann.psid)(req, res, next))
    return next()
  },
  async (req, res) => {
    delete req.ann.cid
    delete req.ann.psid
    return res.status(hsc.ok).json(req.ann)
  })

const getMsgInSection = (idName) => {
  return async (req, res) => {
    let ret, limit = req.query.limit, id = req.params.id
    if (limit) {
      let query = `SELECT "mid" AS "id", "title", "content", "when" AS "time" FROM "message" WHERE "from_del" = FALSE AND "to" IS NULL AND "${idName}" = $1 ORDER BY "when" DESC LIMIT $2`
      ret = (await db.query(query, [id, limit])).rows
    } else {
      let query = `SELECT "mid" AS "id", "title", "content", "when" AS "time" FROM "message" WHERE "from_del" = FALSE AND "to" IS NULL AND "${idName}" = $1 ORDER BY "when" DESC`
      ret = (await db.query(query, [id])).rows
    }
    if (ret) return res.status(hsc.ok).json(ret)
    else return res.sendStatus(hsc.notFound)
  }
}

router.get('/course/:id(\\d+)', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.id)(req, res, next))
  },
  getMsgInSection('cid'))

router.get('/contest/:id(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.id)(req, res, next))
  },
  getMsgInSection('psid'))

router.get('/assignment/:id(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.id)(req, res, next))
  },
  getMsgInSection('psid'))

router.get('/global', lc, async (req, res) => {
  let ret, limit = req.query.limit
  if (limit) {
    let query = 'SELECT "mid" AS "id", "title", "content", "when" AS "time" FROM "message" WHERE "from_del" = FALSE AND "to" IS NULL AND "cid" IS NULL AND "psid" IS NULL ORDER BY "when" DESC LIMIT $1'
    ret = (await db.query(query, [limit])).rows
  } else {
    let query = 'SELECT "mid" AS "id", "title", "content", "when" AS "time" FROM "message" WHERE "from_del" = FALSE AND "to" IS NULL AND "cid" IS NULL AND "psid" IS NULL ORDER BY "when" DESC'
    ret = (await db.query(query)).rows
  }
  if (ret) return res.status(hsc.ok).json(ret)
  else return res.sendStatus(hsc.notFound)
})

module.exports = router
