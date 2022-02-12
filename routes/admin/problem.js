let express = require('express')
let router = express.Router()
let hsc = require('../../config/http-status-code')
let lc = require('../midwares/login-check')
let db = require('../../utils/database')
let mc = require('../midwares/member-check')
let pc = require('../midwares/permission-check')
let { getProblemStructure } = require('../../utils/judge')
const fs = require('fs-extra')

const insertProblem = async (params) => {
  let { psid, title, extra, specialJudge, detailJudge, cases, timeLimit, memoryLimit, ownerId } = params
  let pid, query = 'INSERT INTO "problem" ("psid", "title", "extra", "submit_ac", "submit_all", "special_judge", "detail_judge", "cases", "time_limit", "memory_limit", "owner_id") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING "pid"'
  try {
    pid = (await db.query(query, [psid, title, extra, 0, 0, specialJudge, detailJudge, cases, timeLimit, memoryLimit, ownerId])).rows[0].pid
  } catch (err) {
    console.error(err)
    return 0
  }
  return parseInt(pid)
}

const genPerms = (fromPid, verb, toPsid) => {
  return async (req, res, next) => {
    let query = 'SELECT "psid" FROM "problem" WHERE "pid" = $1'
    let { psid } = (await db.query(query, [fromPid])).rows[0]
    let fromLoc, toLoc, toPsLoc
    if (psid > 0) fromLoc = 'Local'
    else fromLoc = 'Global'
    req.from = {
      pid: fromPid,
      psid: psid
    }
    req.to = {
      psid: undefined,
      cid: undefined
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

  }
  async (req, res, next) => {
    if (req.)
  },
)

module.exports = router

