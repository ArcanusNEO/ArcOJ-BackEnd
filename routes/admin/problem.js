let express = require('express')
let router = express.Router()
let hsc = require('../../config/http-status-code')
let lc = require('../midwares/login-check')
let db = require('../../utils/database')
let mtc = require('../midwares/maintainer-check')
let pc = require('../midwares/permission-check')
let { getProblemStructure } = require('../../utils/judge')
let fs = require('fs-extra')

const insertProblem = async (params) => {
  let { psid, title, extra, specialJudge, detailJudge, cases, timeLimit, memoryLimit, ownerId } = params
  let pid, query = 'INSERT INTO "problem" ("psid", "title", "extra", "submit_ac", "submit_all", "special_judge", "detail_judge", "cases", "time_limit", "memory_limit", "owner_id") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING "pid"'
  try {
    pid = (await db.query(query, [psid, title, extra, 0, 0, specialJudge, detailJudge, cases, timeLimit, memoryLimit, ownerId])).rows[0].pid
    pid = parseInt(pid)
  } catch (err) {
    console.error(err)
    return 0
  }
  return (pid > 0 ? pid : 0)
}

const genPerms = (fromPid, verb, toPsid) => {
  return async (req, res, next) => {
    let fromLoc, toLoc, toPsLoc, fromPsid = null, query, ret
    if (verb === 'fork') {
      query = 'SELECT "psid" FROM "problem" WHERE "pid" = $1'
      ret = (await db.query(query, [fromPid])).rows[0]
      if (!ret) return res.sendStatus(hsc.badReq)
      fromPsid = ret.psid
      if (fromPsid > 0) fromLoc = 'Local'
      else fromLoc = 'Global'
    }
    req.from = {
      pid: fromPid,
      psid: fromPsid
    }
    req.to = {
      psid: null,
      cid: null
    }
    if (toPsid > 0) {
      toLoc = 'Local'
      query = 'SELECT "cid" FROM "problemset" WHERE "psid" = $1'
      let { cid } = (await db.query(query, [toPsid])).rows[0]
      if (cid > 0) toPsLoc = 'Local'
      else toPsLoc = 'Global'
      req.to = {
        psid: toPsid,
        cid: cid
      }
    } else toLoc = 'Global'
    req.reqPerms = [`edit${toLoc}Problem`]
    if (verb === 'fork') req.reqPerms.push(`fork${fromLoc}Problem`)
    if (toPsid > 0) req.reqPerms.push(`edit${toPsLoc}Problemset`)
    return next()
  }
}

const forkProblem = async (req, res) => {
  let query = 'SELECT * FROM "problem" WHERE "pid" = $1'
  let ret = (await db.query(query, [fromPid])).rows[0]
  if (!ret) return res.sendStatus(hsc.internalSrvErr)
  let { title, extra, cases } = ret
  let specialJudge = ret.special_judge
  let detailJudge = ret.detail_judge
  let timeLimit = ret.time_limit
  let memoryLimit = ret.memory_limit
  let ownerId = req.tokenAcc.uid, psid = req.to.psid
  let params = { psid, title, extra, specialJudge, detailJudge, cases, timeLimit, memoryLimit, ownerId }
  let toPid = await insertProblem(params)
  if (toPid === 0) res.sendStatus(hsc.internalSrvErr)
  let fromPid = parseInt(req.params.pid)
  let fromStruct = getProblemStructure(fromPid)
  let toStruct = getProblemStructure(toPid)
  await fs.ensureDir(toStruct.path.data)
  await fs.ensureDir(toStruct.path.spj)
  await fs.ensureDir(toStruct.path.problem)
  await fs.copy(fromStruct.path.data, toStruct.path.data)
  await fs.copy(fromStruct.path.spj, toStruct.path.spj)
  await fs.copy(fromStruct.file.md, toStruct.file.md)
  return res.status(hsc.ok).json(toPid)
}

router.get('/fork/:pid(\\d+)/into/:psid(\\d+)', lc,
  async (req, res, next) => {
    let pid = parseInt(req.params.pid)
    let psid = parseInt(req.params.psid)
    if (pid > 0 && psid > 0) return genPerms(pid, 'fork', psid)(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  },
  async (req, res, next) => {
    return mtc.problemset(req.tokenAcc.uid, req.to.psid)(req, res, next)
  }, forkProblem
)

router.get('/fork/:pid(\\d+)/global', lc,
  async (req, res, next) => {
    let pid = parseInt(req.params.pid)
    if (pid > 0) return genPerms(pid, 'fork', null)(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  }, forkProblem
)

const createProblem = async (req, res) => {
  let { title, extra, specialJudge, detailJudge, cases, timeLimit, memoryLimit } = req.body
  let psid = req.to.psid, ownerId = req.tokenAcc.uid
  let params = { psid, title, extra, specialJudge, detailJudge, cases, timeLimit, memoryLimit, ownerId }
  let pid = await insertProblem(params)
  if (pid === 0) res.sendStatus(hsc.internalSrvErr)
  let struct = getProblemStructure(pid)
  await fs.remove(struct.path.data)
  await fs.remove(struct.path.spj)
  await fs.remove(struct.file.md)
  return res.status(hsc.ok).json(pid)
}

router.post('/create/global', lc,
  async (req, res, next) => {
    return genPerms(null, 'create', null)(req, res, next)
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  }, createProblem
)

router.post('/create/into/:psid(\\d+)', lc,
  async (req, res, next) => {
    let psid = parseInt(req.params.psid)
    if (psid > 0) return genPerms(null, 'create', psid)(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  },
  async (req, res, next) => {
    return mtc.problemset(req.tokenAcc.uid, req.to.psid)(req, res, next)
  }, createProblem
)

module.exports = router
