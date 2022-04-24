import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import lc from './midwares/login-check.mjs'
import db from '../utils/database.mjs'
import mc from './midwares/member-check.mjs'
import judgecore from '../utils/nku-judgecore.mjs'
const { getProblemStructure } = judgecore
import fs from 'fs-extra'

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
    let query = 'SELECT "problem"."pid", "problem"."title" AS "name" FROM "problem"'
    let param = []
    if (psid > 0) query += ` WHERE "problem"."psid" = $${param.push(psid)}`
    else if (psid === 0) { /* all */ }
    else query += ' WHERE "problem"."psid" ISNULL'
    query += ` ORDER BY ${order} ASC`
    if (limit > 0) {
      query += ` LIMIT $${param.push(limit)}`
      if (offset >= 0) query += ` OFFSET $${param.push(offset)}`
    }
    let ret = (await db.query(query, param)).rows
    for (let each of ret) {
      query = 'SELECT MAX("score") AS "score" FROM "solution" WHERE "pid" = $1 AND "uid" = $2'
      let { score } = (await db.query(query, [each.pid, uid])).rows[0]
      score = parseInt(score)
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
  async (req, res) => {
    let pid = req.params.pid
    let uid = req.tokenAcc.uid
    let query = 'SELECT "problem"."pid", "problem"."psid", "problem"."title" AS "name", "problem"."extra", "problem"."submit_ac" AS "submitAc", "problem"."submit_all" AS "submitAll", "problem"."special_judge" AS "specialJudge", "problem"."detail_judge" AS "detailJudge", "problem"."cases", "problem"."time_limit" AS "timeLimit", "problem"."memory_limit" AS "memoryLimit", "problem"."owner_id" AS "ownerId", "problem"."extension" FROM "problem" WHERE "problem"."pid" = $1'
    let ret = (await db.query(query, [pid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    let psid = ret.psid
    query = 'SELECT MAX("score") AS "score" FROM "solution" WHERE "pid" = $1 AND "uid" = $2'
    let { score } = (await db.query(query, [pid, uid])).rows[0]
    score = parseInt(score)
    if (score >= 100) ret.status = 2 // 已通过
    else if (score >= 0) ret.status = 1 // 已提交
    else ret.status = 0 // 未提交
    let { extension } = ret
    try {
      let problem = getProblemStructure(pid).file[extension]
      if (!problem) throw Error('Unkown file extension')
      ret.content = await fs.readFile(problem)
    } catch (err) {
      console.error(err)
      return res.sendStatus(hsc.unauthorized)
    }
    if (!psid || req.tokenAcc.permission >= 2) return res.status(hsc.ok).json(ret)
    query = 'SELECT * FROM "problem_maintainer" WHERE "pid" = $1 AND "uid" = $2'
    let check = (await db.query(query, [pid, uid])).rows[0]
    if (check) return res.status(hsc.ok).json(ret)
    query = 'SELECT * FROM "problemset_user" WHERE "psid" = $1 AND "uid" = $2'
    check = (await db.query(query, [psid, uid])).rows[0]
    if (!check) return res.sendStatus(hsc.forbidden)
    query = 'SELECT (NOW()::TIMESTAMPTZ < LOWER("problemset"."during")) AS "before" FROM "problemset" WHERE "psid" = $1'
    check = (await db.query(query, [psid])).rows[0].before
    if (check) return res.sendStatus(hsc.forbidden)
    return res.status(hsc.ok).json(ret)
  }
)

export default router

