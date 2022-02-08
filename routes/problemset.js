let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let mc = require('./midwares/member-check')

const getAll = (property) => {
  return async (req, res) => {
    let uid = req.tokenAcc.uid, ret = {}
    let cid = parseInt(req.query.cid)
    let param = []
    let query = `SELECT "problemset"."psid" AS "id", "title" AS "name" FROM "problemset_user" INNER JOIN "problemset" ON "problemset"."psid" = "problemset_user"."psid" WHERE "uid" = ${param.push(uid)} AND "type" = ${property}`
    if (cid > 0) query += ` AND "cid" = ${param.push(cid)}`
    query += ' ORDER BY "problemset"."psid" DESC'
    ret[property] = (await db.query(query, param)).rows
    return res.status(hsc.ok).json(ret)
  }
}
router.get('/id/:psid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  },
  async (req, res) => {
    let query = 'SELECT "problemset"."title" AS "name", "problemset"."description" AS "description", "private", "during", "course"."title" AS "courseName" FROM "problemset" LEFT JOIN "course" ON "problemset"."cid" = "course"."cid" WHERE "psid" = $1 AND "course"."visiable" = TRUE'
    let ret = (await db.query(query, [req.params.psid])).rows[0]
    if (ret) return res.status(hsc.ok).json(ret)
    else return res.sendStatus(hsc.unauthorized)
  })

module.exports = { getAll, router }