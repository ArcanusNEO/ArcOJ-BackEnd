let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let lc = require('./midwares/login-check')
let db = require('../utils/database')
let mc = require('./midwares/member-check')
let { getProblemStructure } = require('../utils/judge')
let fs = require('fs-extra')

const getCount = (psid) => {
  psid = parseInt(psid)
  return async (req, res) => {
    let query = '', total
    if (psid > 0) {
      query = 'SELECT COUNT(*) FROM "problem" WHERE "psid" = $1'
      total = parseInt((await db.query(query, [psid])).rows[0].count)
    } else if (psid === 0) {
      query = 'SELECT COUNT(*) FROM "problem"'
      total = parseInt((await db.query(query)).rows[0].count)
    } else {
      query = 'SELECT COUNT(*) FROM "problem" WHERE "psid" ISNULL'
      total = parseInt((await db.query(query)).rows[0].count)
    }
    return res.status(hsc.ok).json(total)
  }
}

const getList = (psid, order = '"problem"."title"') => {
  psid = parseInt(psid)
  return async (req, res) => {
    let { page, item } = req.query
    page = parseInt(page)
    item = parseInt(item)
    let uid = req.tokenAcc.uid
    let limit = item, offset = (page - 1) * item
    let query = 'SELECT "problem"."pid", "problem"."title" AS "name", MAX("solution"."score") AS "score" FROM "problem" LEFT JOIN "solution" ON "problem"."pid" = "solution"."pid"'
    let param = []
    if (psid > 0) query += ` WHERE "problem"."psid" = $${param.push(psid)}`
    else if (psid === 0) { /* all */ }
    else query += ' WHERE "problem"."psid" ISNULL'
    query += ` AND ("solution"."uid" = $${param.push(uid)} OR "solution"."uid" ISNULL) GROUP BY "problem"."pid", "problem"."title" ORDER BY ${order} ASC`
    if (limit > 0) {
      query += ` LIMIT $${param.push(limit)}`
      if (offset >= 0) query += ` OFFSET $${param.push(offset)}`
    }
    let ret = (await db.query(query, param)).rows
    for (let each of ret) {
      let score = parseInt(each.score)
      delete each.score
      if (score >= 100) each.status = 2 // 已通过
      else if (score >= 0) each.status = 1 // 已提交
      else each.status = 0 // 未提交
    }
    return res.status(hsc.ok).json(ret)
  }
}

router.get('/global/total', lc, getCount(undefined))
router.get('/contest(s)?/:id(\\d+)/total', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.id)(req, res, next))
  },
  async (req, res) => {
    return getCount(req.params.id)(req, res)
  })
router.get('/assignment(s)?/:id(\\d+)/total', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.id)(req, res, next))
  },
  async (req, res) => {
    return getCount(req.params.id)(req, res)
  })
router.get('/problemset(s)?/:id(\\d+)/total', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.id)(req, res, next))
  },
  async (req, res) => {
    return getCount(req.params.id)(req, res)
  })

router.get('/global', lc, getList(-1, '"problem"."pid"'))
router.get('/contest(s)?/:id(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.id)(req, res, next))
  },
  async (req, res) => {
    return getList(req.params.id)(req, res)
  })
router.get('/assignment(s)?/:id(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.id)(req, res, next))
  },
  async (req, res) => {
    return getList(req.params.id)(req, res)
  })
router.get('/problemset(s)?/:id(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.id)(req, res, next))
  },
  async (req, res) => {
    return getList(req.params.id)(req, res)
  })

router.get('/id/:pid(\\d+)', lc,
  async (req, res, next) => {
    let pid = req.params.pid
    let uid = req.tokenAcc.uid
    let query = 'SELECT "problem"."pid", "problem"."psid", "problem"."title" AS "name", "problem"."extra", "problem"."submit_ac" AS "submitAc", "problem"."submit_all" AS "submitAll", "problem"."special_judge" AS "specialJudge", "problem"."detail_judge" AS "detailJudge", "problem"."cases", "problem"."time_limit" AS "timeLimit", "problem"."memory_limit" AS "memoryLimit", "problem"."owner_id" AS "ownerId", MAX("solution"."score") AS "score" FROM "problem" LEFT JOIN "solution" ON "problem"."pid" = "solution"."pid" WHERE "problem"."pid" = $1 AND ("solution"."uid" = $2 OR "solution"."uid" ISNULL) GROUP BY "problem"."pid", "problem"."psid", "problem"."title", "problem"."extra", "problem"."submit_ac", "problem"."submit_all", "problem"."special_judge", "problem"."cases", "problem"."time_limit", "problem"."memory_limit", "problem"."owner_id"'
    let ret = (await db.query(query, [pid, uid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    let score = parseInt(ret.score)
    delete ret.score
    if (score >= 100) ret.status = 2 // 已通过
    else if (score >= 0) ret.status = 1 // 已提交
    else ret.status = 0 // 未提交
    ret.psid = parseInt(ret.psid)
    req.ret = ret
    return next()
  },
  async (req, res, next) => {
    if (req.ret.psid > 0) return (mc['problemset'](req.tokenAcc.uid, req.ret.psid)(req, res, next))
    return next()
  },
  async (req, res) => {
    try {
      let problem = getProblemStructure(req.params.pid).file.md
      req.ret.content = await fs.readFile(problem)
    } catch (err) {
      console.error(err)
      return res.sendStatus(hsc.unauthorized)
    }
    return res.status(hsc.ok).json(req.ret)
  }
)

module.exports = router

