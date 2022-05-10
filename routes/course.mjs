import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import db from '../utils/database.mjs'
import lc from './midwares/login-check.mjs'
import pc from './midwares/permission-check.mjs'

router.get('/', lc, async (req, res) => {
  let uid = req.tokenAcc.uid
  let query = 'SELECT "course"."cid" AS "id", "title" AS "name", "number" FROM "course_user" INNER JOIN "course" ON "course"."cid" = "course_user"."cid" WHERE "uid" = $1 AND "visiable" ORDER BY "course"."cid" DESC'
  let ret = (await db.query(query, [uid])).rows
  return res.status(hsc.ok).json(ret)
})

router.get('/id/:cid(\\d+)', lc, async (req, res) => {
  let query = 'SELECT "title" AS "name", "teacher" AS "teachers", "number", "description", "semester" FROM "course" WHERE "cid" = $1 AND "visiable"'
  let ret = (await db.query(query, [req.params.cid])).rows[0]
  if (ret) return res.status(hsc.ok).json(ret)
  return res.sendStatus(hsc.unauthorized)
})

router.get('/all', lc, async (req, res) => {
  let query = 'SELECT "cid" AS "id", "title" AS "name", ("passcode" ISNULL) AS "public", "number" FROM "course" WHERE "visiable" ORDER BY "cid" DESC'
  let ret = (await db.query(query)).rows
  return res.status(hsc.ok).json(ret)
})

router.post('/subscribe/:cid(\\d+)', lc,
  async (req, res, next) => {
    let cid = parseInt(req.params.cid)
    if (!(cid > 0)) return res.sendStatus(hsc.badReq)
    return pc(req.tokenAcc.uid, ['joinCourse'])(req, res, next)
  },
  async (req, res) => {
    let passcode = req.body.passcode
    let uid = req.tokenAcc.uid
    let cid = parseInt(req.params.cid)
    let sqlParam = [cid]
    let query = 'SELECT "cid" FROM "course" WHERE "cid" = $1 AND "visiable" AND "passcode"'
    if (passcode) {
      query += ' = $2'
      sqlParam.push(passcode)
    } else query += ' ISNULL'
    let ret = (await db.query(query, sqlParam)).rows[0]
    if (!ret) return res.sendStatus(hsc.passwdMismatch)
    query = 'INSERT INTO "course_user" ("cid", "uid") VALUES ($1, $2)'
    try {
      await db.query(query, [cid, uid])
    } catch (err) {
      console.error(err)
      return res.sendStatus(hsc.alreadyExist)
    }
    return res.sendStatus(hsc.ok)
  }
)

export default router