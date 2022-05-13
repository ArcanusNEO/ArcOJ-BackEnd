import express from 'express'
const router = express.Router()
import hsc from '../../config/http-status-code.mjs'
import db from '../../utils/database.mjs'
import lc from '../midwares/login-check.mjs'
import pc from '../midwares/permission-check.mjs'

router.get('/', lc,
  async (req, res, next) => {
    if (!(req.tokenAcc.permission >= 1)) return res.sendStatus(hsc.forbidden)
    return next()
  },
  async (req, res) => {
    let { uid, gid, nickname, email, qq, tel, realname, school, words } = req.query
    let queryStr = 'SELECT "uid", "user"."gid", "title" AS "group", "description" AS "gdesc", "perm", "nickname", "email", "qq", "tel", "realname", "school", "words", "signup_time" AS "signupTime", "removed" FROM "user" INNER JOIN "group" ON "user"."gid" = "group"."gid" WHERE TRUE'
    let allParams = { uid, gid, nickname, email, qq, tel, realname, school, words }
    let param = []
    for (let key in allParams) {
      if (!allParams[key]) continue
      queryStr += ` AND "user"."${key}" = $${param.push(allParams[key])}`
    }
    let page = parseInt(req.query.page), item = parseInt(req.query.item)
    let limit = item, offset = (page - 1) * item
    if (limit > 0) {
      queryStr += ` LIMIT $${param.push(parseInt(limit))}`
      if (offset >= 0) queryStr += ` OFFSET $${param.push(offset)}`
    }
    let ret = (await db.query(queryStr, param)).rows
    return res.status(hsc.ok).json(ret)
  })


router.get('/id/:uid(\\d+)', lc,
  async (req, res, next) => {
    if (!(req.tokenAcc.permission >= 1)) return res.sendStatus(hsc.forbidden)
    return next()
  },
  async (req, res) => {
    let query = 'SELECT "uid", "user"."gid", "title" AS "group", "description" AS "gdesc", "perm", "nickname", "email", "password", "qq", "tel", "realname", "school", "words", "signup_time" AS "signupTime", "removed" FROM "user" INNER JOIN "group" ON "user"."gid" = "group"."gid" WHERE "uid" = $1'
    let ret = (await db.query(query, [req.params.uid])).rows[0]
    return res.status(hsc.ok).json(ret)
  })

export default router
