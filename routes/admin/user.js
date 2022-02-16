const express = require('express')
const router = express.Router()
const hsc = require('../../config/http-status-code')
const db = require('../../utils/database')
const lc = require('../midwares/login-check')
const pc = require('../midwares/permission-check')

router.get('/', lc,
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, ['master'])(req, res, next)
  },
  async (req, res) => {
    let { uid, gid, nickname, email, qq, tel, realname, school, words, limit } = req.query
    let queryStr = 'SELECT * FROM "user" INNER JOIN "group" ON "user"."gid" = "group"."gid" WHERE NOT "user"."removed"'
    let allParams = { uid, gid, nickname, email, qq, tel, realname, school, words }
    let param = []
    for (let key in allParams) {
      if (!allParams[key]) continue
      console.log(allParams[key])
      queryStr += ` AND "user"."${key}" = $${param.push(allParams[key])}`
    }
    if (parseInt(limit) > 0) queryStr += ` LIMIT $${param.push(parseInt(limit))}`
    let ret = (await db.query(queryStr, param)).rows
    return res.status(hsc.ok).json(ret)
  })


router.get('/id/:uid(\\d+)', lc,
  async (req, res, next) => {
    return pc(req.tokenAcc.uid, ['master'])(req, res, next)
  },
  async (req, res) => {
    let query = 'SELECT * FROM "user" WHERE "uid" = $1'
    let ret = (await db.query(query, [req.params.uid])).rows[0]
    return res.status(hsc.ok).json(ret)
  })

module.exports = router
