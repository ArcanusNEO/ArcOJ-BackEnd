let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let mc = require('./midwares/member-check')

const get = (property) => {
  return async (req, res) => {
    let uid = req.tokenAcc.uid
    let cid = parseInt(req.params.cid)
    let param = []
    let query = `SELECT "problemset"."psid" AS "id", "title" AS "name", LOWER("during")::TIMESTAMPTZ AS "begin", UPPER("during")::TIMESTAMPTZ AS "end" FROM "problemset_user" INNER JOIN "problemset" ON "problemset"."psid" = "problemset_user"."psid" WHERE "uid" = $${param.push(uid)} AND "type" = '${property}'`
    if (cid > 0) query += ` AND "cid" = $${param.push(cid)}` // 返回 course = cid
    else if (cid === 0) { /* 返回所有的 */ }
    else query += ' AND "cid" ISNULL' // 返回 global
    query += ' ORDER BY "problemset"."psid" DESC'
    let ret = (await db.query(query, param)).rows
    return res.status(hsc.ok).json(ret)
  }
}

const getOpen = (property) => {
  return async (req, res) => {
    let uid = req.tokenAcc.uid
    let cid = parseInt(req.params.cid)
    let param = []
    let query = 'SELECT "problemset"."psid" AS "id", "problemset"."title" AS "name", LOWER("during")::TIMESTAMPTZ AS "begin", UPPER("during")::TIMESTAMPTZ AS "end"'
    if (cid >= 0) query += ', "course"."title" AS "courseName"'
    query += ' FROM "problemset" INNER JOIN "problemset_user" ON "problemset"."psid" = "problemset_user"."psid"'
    if (cid > 0) query += ` INNER JOIN "course" ON "problemset"."cid" = "course"."cid" WHERE "problemset"."cid" = $${param.push(cid)}` // 返回 course = cid
    else if (cid === 0) query += ` LEFT JOIN "course" ON "problemset"."cid" = "course"."cid" WHERE TRUE` // 返回所有的
    else query += ' WHERE "problemset"."cid" ISNULL' // 返回 global
    query += ` AND NOW()::TIMESTAMPTZ <@ "problemset"."during" AND "problemset_user"."uid" = $${param.push(uid)} AND "problemset"."type" = '${property}' ORDER BY "end" ASC`
    let ret = (await db.query(query, param)).rows
    return res.status(hsc.ok).json(ret)
  }
}

const getDetail = async (req, res) => {
  let query = 'SELECT "problemset"."title" AS "name", "problemset"."description" AS "description", "problemset"."type", "problemset"."private", LOWER("problemset"."during")::TIMESTAMPTZ AS "begin", UPPER("problemset"."during")::TIMESTAMPTZ AS "end", "course"."title" AS "courseName", NOW()::TIMESTAMPTZ <@ "problemset"."during" AS "open" FROM "problemset" LEFT JOIN "course" ON "problemset"."cid" = "course"."cid" WHERE "psid" = $1'
  let ret = (await db.query(query, [req.params.psid])).rows[0]
  return res.status(hsc.ok).json(ret)
}

router.get('/id/:psid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  }, getDetail)

module.exports = { get, getOpen, getDetail, router }