let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let mc = require('./midwares/member-check')

const getAll = (property) => {
  return async (req, res) => {
    let uid = req.tokenAcc.uid
    let cid = parseInt(req.query.cid)
    let param = []
    let query = `SELECT "problemset"."psid" AS "id", "title" AS "name", "during" FROM "problemset_user" INNER JOIN "problemset" ON "problemset"."psid" = "problemset_user"."psid" WHERE "uid" = $${param.push(uid)} AND "type" = '${property}'`
    if (cid > 0) query += ` AND "cid" = $${param.push(cid)}`
    query += ' ORDER BY "problemset"."psid" DESC'
    return res.status(hsc.ok).json((await db.query(query, param)).rows)
  }
}

const getBanner = (property) => {
  return async (req, res) => {
    let uid = req.tokenAcc.uid
    let cid = parseInt(req.query.cid)
    let param = []
    let query = `SELECT "problemset"."psid" AS "id", "problemset"."title" AS "name", UPPER("problemset"."during")::TIMESTAMPTZ AS "deadline", "course"."title" AS "courseName" FROM "problemset" INNER JOIN "problemset_user" ON "problemset"."psid" = "problemset_user"."psid" LEFT JOIN "course" ON "problemset"."cid" = "course"."cid" WHERE NOW()::TIMESTAMPTZ <@ "problemset"."during" AND "problemset_user"."uid" = $${param.push(uid)} AND "problemset"."type" = '${property}'`
    if (cid > 0) query += ` AND "problemset"."cid" = $${param.push(cid)}`
    query += ' ORDER BY "deadline" ASC'
    return res.status(hsc.ok).json((await db.query(query, param)).rows)
  }
}

router.get('/id/:psid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  },
  async (req, res) => {
    let query = 'SELECT "problemset"."title" AS "name", "problemset"."description" AS "description", "private", "during", "course"."title" AS "courseName" FROM "problemset" LEFT JOIN "course" ON "problemset"."cid" = "course"."cid" WHERE "psid" = $1 AND "course"."visiable"'
    let ret = (await db.query(query, [req.params.psid])).rows[0]
    if (ret) return res.status(hsc.ok).json(ret)
    else return res.sendStatus(hsc.notFound)
  })

module.exports = { getAll, router }