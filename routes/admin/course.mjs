import express from 'express'
const router = express.Router()
import hsc from '../../config/http-status-code.mjs'
import lc from '../midwares/login-check.mjs'
import pc from '../midwares/permission-check.mjs'
import db from '../../utils/database.mjs'

router.get('/', lc,
  async (req, res, next) => {
    return (pc(req.tokenAcc.uid, ['editCourse'])(req, res, next))
  },
  async (req, res) => {
    let query = 'SELECT "course"."title" AS "name", "course"."cid" AS "id" FROM "course" INNER JOIN "course_maintainer" ON "course"."cid" = "course_maintainer"."cid" WHERE "course_maintainer"."uid" = $1 ORDER BY "course"."cid" DESC'
    let ret = (await db.query(query, [req.tokenAcc.uid])).rows
    return res.status(hsc.ok).json(ret)
  })

export default router
