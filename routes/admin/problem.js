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

router.get('/fork/:pid(\\d+)', lc,
  async (req, res, next) => {
    let query = 'SELECT "psid" FROM "problem" WHERE "pid" = $1'
    let psid = parseInt((await db.query(query, [req.params.pid])).rows[0].psid)
    let location
    if (psid > 0) location = 'Local'
    else location = 'Global'
    req.from = psid
    req.reqPerms = [`edit${location}Problem`, `fork${location}Problem`]
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  },
)

module.exports = router

