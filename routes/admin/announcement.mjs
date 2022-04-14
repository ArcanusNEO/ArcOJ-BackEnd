import express from 'express'
const router = express.Router()
import hsc from '../../config/http-status-code.mjs'
import lc from '../midwares/login-check.mjs'
import db from '../../utils/database.mjs'
import mtc from '../midwares/maintainer-check.mjs'
import pcrb from '../midwares/permission-check-ret-bool.mjs'
import pc from '../midwares/permission-check.mjs'

router.get('/id/:mid(\\d+)', lc,
  async (req, res, next) => {
    req.master = await pcrb(req.tokenAcc.uid, ['master'])
    let mid = parseInt(req.params.mid)
    if (!(mid > 0)) return res.sendStatus(hsc.badReq)
    if (req.master) return next()
    return res.sendStatus(hsc.forbidden)
  },
  async (req, res) => {
    let query = 'SELECT "cid", "psid", "mid", "title", "content", "when" AS "time" FROM "message" WHERE NOT "from_del" AND "to" IS NULL AND "mid" = $1'
    let mid = parseInt(req.params.mid)
    let ret = (await db.query(query, [mid])).rows[0]
    if (!ret) return res.sendStatus(hsc.badReq)
    return res.status(hsc.ok).json(ret)
  }
)

export default router
