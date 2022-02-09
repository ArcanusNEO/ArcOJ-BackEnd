let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let lc = require('./midwares/login-check')
let db = require('../utils/database')
let mc = require('./midwares/member-check')
let { getProblemStructure } = require('../utils/judge')
const fs = require('fs-extra')

const getCount = (psid) => {
  psid = parseInt(psid)
  return async (req, res) => {
    let query = '', total
    if (psid > 0) {
      query = 'SELECT COUNT(*) FROM "problem" WHERE "psid" = $1'
      total = parseInt((await db.query(query, [psid])).rows[0].count)
    } else {
      query = 'SELECT COUNT(*) FROM "problem" WHERE "psid" ISNULL'
      total = parseInt((await db.query(query)).rows[0].count)
    }
    if (total >= 0) return res.status(hsc.ok).json(total)
    return res.sendStatus(hsc.notFound)
  }
}

const getList = (psid) => {
  psid = parseInt(psid)
  return async (req, res) => {
    let limit = req.query.limit, offset = req.query.offset
    //TODO
  }
}

router.get('/total', lc, getCount(undefined))
router.get('/contest/:id(\\d+)/total', lc, async (req, res) => {
  return getCount(req.params.id)(req, res)
})
router.get('/assignment/:id(\\d+)/total', lc, async (req, res) => {
  return getCount(req.params.id)(req, res)
})

router.get('/', lc, getList(undefined))
router.get('/contest/:id(\\d+)', lc, async (req, res) => {
  return getList(req.params.id)(req, res)
})
router.get('/assignment/:id(\\d+)', lc, async (req, res) => {
  return getList(req.params.id)(req, res)
})

router.get('/id/:pid(\\d+)', lc,
  async (req, res, next) => {
    let pid = req.params.pid
    let query = 'SELECT * FROM "problem" WHERE "pid" = $1 LIMIT 1'
    let ret = (await db.query(query, [pid])).rows[0]
    if (!ret) return res.sendStatus(hsc.notFound)
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
      let problem = getProblemStructure(pid).file.md
      req.ret.content = await fs.readFile(problem)
    } catch (err) {
      console.error(err)
      return res.sendStatus(hsc.notFound)
    }
    return res.status(hsc.ok).json(req.ret)
  }
)

module.exports = router
