let express = require('express')
let router = express.Router()
let hsc = require('../../config/http-status-code')
let lc = require('../midwares/login-check')
let db = require('../../utils/database')
let mtc = require('../midwares/maintainer-check')
let pc = require('../midwares/permission-check')
let { getProblemStructure } = require('../../utils/judge')
let fs = require('fs-extra')
let fileUpload = require('express-fileupload')

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

const preCheck = (fromPid, verb, toPsid) => {
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
    // if (toPsid > 0) req.reqPerms.push(`edit${toPsLoc}Problemset`)
    return next()
  }
}

const forkProblem = async (req, res) => {
  let fromPid = parseInt(req.params.pid)
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
  let fromStruct = getProblemStructure(fromPid)
  let toStruct = getProblemStructure(toPid)
  await fs.ensureDir(toStruct.path.data)
  await fs.ensureDir(toStruct.path.spj)
  await fs.ensureDir(toStruct.path.problem)
  await fs.copy(fromStruct.path.data, toStruct.path.data)
  await fs.copy(fromStruct.path.spj, toStruct.path.spj)
  await fs.copy(fromStruct.file.md, toStruct.file.md)
  query = 'INSERT INTO "problem_maintainer" ("pid", "uid") VALUES ($1, $2)'
  await db.query(query, [toPid, ownerId])
  return res.status(hsc.ok).json(toPid)
}

router.get('/fork/:pid(\\d+)/into/:psid(\\d+)', lc,
  async (req, res, next) => {
    let pid = parseInt(req.params.pid)
    let psid = parseInt(req.params.psid)
    if (pid > 0 && psid > 0) return preCheck(pid, 'fork', psid)(req, res, next)
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
    if (pid > 0) return preCheck(pid, 'fork', null)(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  }, forkProblem
)

const createProblem = async (req, res) => {
  let { title, extra, specialJudge, detailJudge, cases, timeLimit, memoryLimit, content } = req.body
  let psid = req.to.psid, ownerId = req.tokenAcc.uid
  let params = { psid, title, extra, specialJudge, detailJudge, cases, timeLimit, memoryLimit, ownerId }
  let pid = await insertProblem(params)
  if (pid === 0) res.sendStatus(hsc.internalSrvErr)
  let struct = getProblemStructure(pid)
  await fs.ensureDir(struct.path.problem)
  await fs.remove(struct.path.data)
  await fs.remove(struct.path.spj)
  await fs.remove(struct.file.md)
  await fs.ensureDir(struct.path.data)
  await fs.ensureDir(struct.path.spj)
  await fs.writeFile(struct.file.md, content)
  let query = 'INSERT INTO "problem_maintainer" ("pid", "uid") VALUES ($1, $2)'
  await db.query(query, [pid, ownerId])
  return res.status(hsc.ok).json(pid)
}


router.post('/create/global', lc,
  async (req, res, next) => {
    req.body.title = req.body.title || req.body.name
    return preCheck(null, 'create', null)(req, res, next)
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  }, createProblem
)

router.post('/create/into/:psid(\\d+)', lc,
  async (req, res, next) => {
    req.body.title = req.body.title || req.body.name
    let psid = parseInt(req.params.psid)
    if (psid > 0) return preCheck(null, 'create', psid)(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  },
  async (req, res, next) => {
    return mtc.problemset(req.tokenAcc.uid, req.to.psid)(req, res, next)
  }, createProblem
)

router.post('/update/:pid(\\d+)', lc,
  async (req, res, next) => {
    req.body.title = req.body.title || req.body.name
    let pid = parseInt(req.params.pid)
    if (!(pid > 0)) return res.sendStatus(hsc.badReq)
    let query = 'SELECT "pid", "psid" FROM "problem" WHERE "pid" = $1'
    let ret = (await db.query(query, [pid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    let psid = ret.psid
    return preCheck(pid, 'update', psid)(req, res, next)
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  },
  async (req, res, next) => {
    return mtc.problem(req.tokenAcc.uid, parseInt(req.params.pid))(req, res, next)
  },
  async (req, res) => {
    let { title, extra, specialJudge, detailJudge, cases, timeLimit, memoryLimit, content } = req.body
    let psid = req.to.psid, param = [psid]
    let pid = req.from.pid
    let items = { title, extra, specialJudge, detailJudge, cases, timeLimit, memoryLimit }
    let itemsMap = { title: 'title', extra: 'extra', specialJudge: 'special_judge', detailJudge: 'detail_judge', cases: 'cases', timeLimit: 'time_limit', memoryLimit: 'memory_limit' }
    let query = 'UPDATE "problem" SET "psid" = $1'
    for (let key in items)
      if (items[key]) query += `, "${itemsMap[key]}" = $${param.push(items[key])}`
    query += ` WHERE "pid" = $${param.push(pid)} RETURNING "pid", "psid", "title" AS "name", "extra", "submit_ac" AS "submitAc", "submit_all" AS "submitAll", "special_judge" AS "speciaJudge", "detail_judge" AS "detailJudge", "cases", "time_limit" AS "timeLimit", "memory_limit" AS "memoryLimit", "owner_id" AS "ownerId"`
    let ret = (await db.query(query, param)).rows[0]
    if (content) {
      let struct = getProblemStructure(pid)
      await fs.remove(struct.file.md)
      await fs.writeFile(struct.file.md, content)
    }
    return res.status(hsc.ok).json(ret)
  }
)

router.get('/', lc, async (req, res) => {
  let { page, item } = req.query
  page = parseInt(page)
  item = parseInt(item)
  let uid = req.tokenAcc.uid
  let limit = item, offset = (page - 1) * item
  let param = []
  let query = `SELECT "problem"."pid" AS "id", "problem"."title" AS "name" FROM "problem_maintainer" INNER JOIN "problem" ON "problem"."pid" = "problem_maintainer"."pid" WHERE "problem_maintainer"."uid" = $${param.push(uid)} ORDER BY "problem"."pid" DESC`
  if (limit > 0) {
    query += ` LIMIT $${param.push(limit)}`
    if (offset >= 0) query += ` OFFSET $${param.push(offset)}`
  }
  let ret = (await db.query(query, param)).rows
  return res.status(hsc.ok).json(ret)
})

router.get('/total', lc, async (req, res) => {
  let query = 'SELECT COUNT(*) FROM "problem_maintainer" INNER JOIN "problem" ON "problem"."pid" = "problem_maintainer"."pid" WHERE "uid" = $1'
  let total = (await db.query(query, [req.tokenAcc.uid])).rows[0].count
  return res.status(hsc.ok).json(parseInt(total))
})

router.get('/id/:pid(\\d+)', lc,
  async (req, res, next) => {
    let pid = parseInt(req.params.pid)
    if (pid > 0) return mtc.problem(req.tokenAcc.uid, pid)(req, res, next)
    return res.sendStatus(hsc.badReq)
  },
  async (req, res, next) => {
    let pid = parseInt(req.params.pid)
    let query = 'SELECT "problem"."pid", "problem"."psid", "problem"."title" AS "name", "problem"."extra", "problem"."submit_ac" AS "submitAc", "problem"."submit_all" AS "submitAll", "problem"."special_judge" AS "specialJudge", "problem"."detail_judge" AS "detailJudge", "problem"."cases", "problem"."time_limit" AS "timeLimit", "problem"."memory_limit" AS "memoryLimit", "problem"."owner_id" AS "ownerId" FROM "problem" WHERE "problem"."pid" = $1 LIMIT 1'
    let ret = (await db.query(query, [pid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    try {
      let problem = getProblemStructure(pid).file.md
      ret.content = await fs.readFile(problem)
    } catch (err) {
      console.error(err)
      return res.sendStatus(hsc.unauthorized)
    }
    return res.status(hsc.ok).json(ret)
  }
)

router.use(fileUpload({
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 16 * 1024 * 1024 } // 16M
}))

router.post('/id/:pid(\\d+)/upload/io', lc,
  async (req, res, next) => {
    let pid = parseInt(req.params.pid)
    if (!(pid > 0)) return res.sendStatus(hsc.badReq)
    let query = 'SELECT "pid", "psid" FROM "problem" WHERE "pid" = $1'
    let ret = (await db.query(query, [pid])).rows[0]
    if (!ret) return res.sendStatus(hsc.unauthorized)
    let psid = ret.psid
    return preCheck(pid, 'update', psid)(req, res, next)
  },
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, req.reqPerms)(req, res, next)
  },
  async (req, res, next) => {
    return mtc.problem(req.tokenAcc.uid, parseInt(req.params.pid))(req, res, next)
  },
  async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) return res.sendStatus(hsc.badReq)
    let pid = parseInt(req.params.pid)
    let struct = getProblemStructure(pid)
    await fs.ensureDir(struct.path.data)
    let query = 'SELECT "cases" FROM "problem" WHERE "pid" = $1'
    let ret = (await db.query(query, [pid])).rows[0]
    if (!ret || !(parseInt(ret.cases) > 0)) return res.sendStatus(hsc.internalSrvErr)
    let cases = parseInt(ret.cases)
    for (let i = 1; i <= cases; ++i) {
      let fileIn = req.files[i + ".in"]
      let fileOut = req.files[i + ".out"]
      if (fileIn) await fileIn.mv(struct.path.data)
      if (fileOut) await fileOut.mv(struct.path.data)
    }
    return res.sendStatus(hsc.ok)
  })

module.exports = router
