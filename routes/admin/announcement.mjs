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

router.post('/create/global', lc,
  async (req, res, next) => {
    req.master = await pcrb(req.tokenAcc.uid, ['master'])
    if (req.master) return next()
    return res.sendStatus(hsc.forbidden)
  },
  async (req, res) => {
    let { title, content } = req.body
    let query = 'INSERT INTO "message" ("from", "to", "title", "content", "when", "from_del", "to_del", "cid", "psid") VALUES ($1, NULL, $2, $3, NOW()::TIMESTAMPTZ, FALSE, FALSE, NULL, NULL) RETURNING "mid"'
    let ret = (await db.query(query, [req.tokenAcc.uid, title, content])).rows[0]
    if (!ret) return res.sendStatus(hsc.internalSrvErr)
    return res.status(hsc.ok).json(ret.mid)
  }
)

router.post('/create/course/:cid(\\d+)', lc,
  async (req, res, next) => {
    req.master = await pcrb(req.tokenAcc.uid, ['master'])
    let cid = parseInt(req.params.cid)
    if (!(cid > 0)) return res.sendStatus(hsc.badReq)
    if (req.master) return next()
    return res.sendStatus(hsc.forbidden)
  },
  async (req, res) => {
    let { title, content } = req.body
    let cid = parseInt(req.params.cid)
    let query = 'INSERT INTO "message" ("from", "to", "title", "content", "when", "from_del", "to_del", "cid", "psid") VALUES ($1, NULL, $2, $3, NOW()::TIMESTAMPTZ, FALSE, FALSE, $4, NULL) RETURNING "mid"'
    let ret = (await db.query(query, [req.tokenAcc.uid, title, content, cid])).rows[0]
    if (!ret) return res.sendStatus(hsc.internalSrvErr)
    return res.status(hsc.ok).json(ret.mid)
  }
)

router.post('/create/problemset/:psid(\\d+)', lc,
  async (req, res, next) => {
    req.master = await pcrb(req.tokenAcc.uid, ['master'])
    let psid = parseInt(req.params.psid)
    if (!(psid > 0)) return res.sendStatus(hsc.badReq)
    if (req.master) return next()
    return res.sendStatus(hsc.forbidden)
  },
  async (req, res) => {
    let { title, content } = req.body
    let psid = parseInt(req.params.psid)
    let query = 'INSERT INTO "message" ("from", "to", "title", "content", "when", "from_del", "to_del", "cid", "psid") VALUES ($1, NULL, $2, $3, NOW()::TIMESTAMPTZ, FALSE, FALSE, NULL, $4) RETURNING "mid"'
    let ret = (await db.query(query, [req.tokenAcc.uid, title, content, psid])).rows[0]
    if (!ret) return res.sendStatus(hsc.internalSrvErr)
    return res.status(hsc.ok).json(ret.mid)
  }
)

export default router
