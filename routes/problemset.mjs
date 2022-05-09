import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import db from '../utils/database.mjs'
import lc from './midwares/login-check.mjs'
import mc from './midwares/member-check.mjs'
import pc from './midwares/permission-check.mjs'

const getPublicNotEnd = async (req, res) => {
  let query = 'SELECT "psid", "title", "type", LOWER("during")::TIMESTAMPTZ AS "begin", UPPER("during")::TIMESTAMPTZ AS "end" FROM "problemset" WHERE NOT "private" AND NOW()::TIMESTAMPTZ < UPPER("during")::TIMESTAMPTZ AND "cid" ISNULL'
  let ret = (await db.query(query)).rows
  return res.status(hsc.ok).json(ret)
}

const get = (property) => {
  return async (req, res) => {
    let uid = req.tokenAcc.uid
    let cid = parseInt(req.params.cid)
    let param = []
    let query = `SELECT "problemset"."psid" AS "id", "problemset"."title" AS "name", LOWER("problemset"."during")::TIMESTAMPTZ AS "begin", UPPER("problemset"."during")::TIMESTAMPTZ AS "end", "course"."title" AS "courseName" FROM "problemset_user" INNER JOIN "problemset" ON "problemset"."psid" = "problemset_user"."psid" LEFT JOIN "course" ON "problemset"."cid" = "course"."cid" WHERE "problemset_user"."uid" = $${param.push(uid)} AND "problemset"."type" = '${property}'`
    if (cid > 0) query += ` AND "problemset"."cid" = $${param.push(cid)}` // 返回 course = cid
    else if (cid === 0) { /* 返回所有的 */ }
    else query += ' AND "problemset"."cid" ISNULL' // 返回 global
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

router.get('/public', lc, getPublicNotEnd)

router.get('/id/:psid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  }, getDetail)

router.get('/subscribe/:psid(\\d+)', lc,
  async (req, res, next) => {
    let psid = parseInt(req.params.psid)
    if (!(psid > 0)) return res.sendStatus(hsc.badReq)
    return pc(req.tokenAcc.uid, ['joinProblemset'])(req, res, next)
  },
  async (req, res) => {
    let uid = req.tokenAcc.uid
    let psid = parseInt(req.params.psid)
    let query = 'SELECT "psid" FROM "problemset" WHERE "psid" = $1 AND NOT "private" AND NOW()::TIMESTAMPTZ < UPPER("during")::TIMESTAMPTZ AND "cid" ISNULL'
    let ret = (await db.query(query, [psid])).rows[0]
    if (!ret) return res.sendStatus(hsc.forbidden)
    query = 'INSERT INTO "problemset_user" ("psid", "uid") VALUES ($1, $2)'
    try {
      await db.query(query, [psid, uid])
    } catch (err) {
      console.error(err)
      return res.sendStatus(hsc.alreadyExist)
    }
    return res.sendStatus(hsc.ok)
  }
)

export default { get, getOpen, getDetail, getPublicNotEnd, router }