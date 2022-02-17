const express = require('express')
const router = express.Router()
const hsc = require('../config/http-status-code')
const db = require('../utils/database')
const lc = require('./midwares/login-check')
const mc = require('./midwares/member-check')

router.get('/id/:id(\\d+)', lc,
  async (req, res, next) => {
    let mid = req.params.id
    let query = `SELECT "cid", "psid", "mid" AS "id", "title", "content", "when" AT TIME ZONE 'UTC-8' AS "time" FROM "message" WHERE NOT "from_del" AND "to" IS NULL AND "mid" = $1`
    let ret = (await db.query(query, [mid])).rows[0]
    if (ret) {
      req.ann = ret
      return next()
    }
    return res.sendStatus(hsc.unauthorized)
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
    let ret, limit = parseInt(req.query.limit), id = parseInt(req.params.id)
    if (!(id > 0)) return res.sendStatus(hsc.badReq)
    if (limit > 0) {
      let query = `SELECT "mid" AS "id", "title", "content", "when" AT TIME ZONE 'UTC-8' AS "time" FROM "message" WHERE "from_del" = FALSE AND "to" IS NULL AND "${idName}" = $1 ORDER BY "when" DESC LIMIT $2`
      ret = (await db.query(query, [id, limit])).rows
    } else {
      let query = `SELECT "mid" AS "id", "title", "content", "when" AT TIME ZONE 'UTC-8' AS "time" FROM "message" WHERE "from_del" = FALSE AND "to" IS NULL AND "${idName}" = $1 ORDER BY "when" DESC`
      ret = (await db.query(query, [id])).rows
    }
    return res.status(hsc.ok).json(ret)
  }
}

router.get('/course(s)?/:id(\\d+)', lc,
  async (req, res, next) => {
    let cid = parseInt(req.params.id)
    if (!(cid > 0)) return res.sendStatus(hsc.badReq)
    return (mc['course'](req.tokenAcc.uid, cid)(req, res, next))
  },
  getMsgInSection('cid'))

router.get('/contest(s)?/:id(\\d+)', lc,
  async (req, res, next) => {
    let psid = parseInt(req.params.id)
    if (!(psid > 0)) return res.sendStatus(hsc.badReq)
    return (mc['problemset'](req.tokenAcc.uid, psid)(req, res, next))
  },
  getMsgInSection('psid'))

router.get('/assignment(s)?/:id(\\d+)', lc,
  async (req, res, next) => {
    let psid = parseInt(req.params.id)
    if (!(psid > 0)) return res.sendStatus(hsc.badReq)
    return (mc['problemset'](req.tokenAcc.uid, psid)(req, res, next))
  },
  getMsgInSection('psid'))

router.get('/global', lc, async (req, res) => {
  let ret, limit = parseInt(req.query.limit)
  if (limit > 0) {
    let query = `SELECT "mid" AS "id", "title", "content", "when" AT TIME ZONE 'UTC-8' AS "time" FROM "message" WHERE "from_del" = FALSE AND "to" IS NULL AND "cid" IS NULL AND "psid" IS NULL ORDER BY "when" DESC LIMIT $1`
    ret = (await db.query(query, [limit])).rows
  } else {
    let query = `SELECT "mid" AS "id", "title", "content", "when" AT TIME ZONE 'UTC-8' AS "time" FROM "message" WHERE "from_del" = FALSE AND "to" IS NULL AND "cid" IS NULL AND "psid" IS NULL ORDER BY "when" DESC`
    ret = (await db.query(query)).rows
  }
  return res.status(hsc.ok).json(ret)
})

module.exports = router
