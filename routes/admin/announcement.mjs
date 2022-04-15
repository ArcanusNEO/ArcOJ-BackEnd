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
    let mid = parseInt(req.params.mid)
    if (!(mid > 0)) return res.sendStatus(hsc.badReq)
    if (!(req.tokenAcc.permission >= 1)) return res.sendStatus(hsc.forbidden)
    return next()
  },
  async (req, res) => {
    let query = 'SELECT "cid", "psid", "mid", "title", "content", "when" AS "time", "from_del" AS "del" FROM "message" WHERE "mid" = $1 AND "to" IS NULL'
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
    let cid = parseInt(req.params.cid)
    if (!(cid > 0)) return res.sendStatus(hsc.badReq)
    req.master = await pcrb(req.tokenAcc.uid, ['master'])
    if (req.master) return next()
    return pc(req.tokenAcc.uid, ['postAnnouncement'])
  },
  async (req, res, next) => {
    if (req.master) return next()
    return mtc.course(req.tokenAcc.uid, req.params.cid)(req, res, next)
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
    let psid = parseInt(req.params.psid)
    if (!(psid > 0)) return res.sendStatus(hsc.badReq)
    req.master = await pcrb(req.tokenAcc.uid, ['master'])
    if (req.master) return next()
    return pc(req.tokenAcc.uid, ['postAnnouncement'])
  },
  async (req, res, next) => {
    if (req.master) return next()
    return mtc.problemset(req.tokenAcc.uid, req.params.psid)(req, res, next)
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

router.post('/update/:mid(\\d+)', lc,
  async (req, res, next) => {
    let mid = parseInt(req.params.mid)
    if (!(mid > 0)) return res.sendStatus(hsc.badReq)
    req.master = await pcrb(req.tokenAcc.uid, ['master'])
    if (req.master) return next()
    return pc(req.tokenAcc.uid, ['postAnnouncement'])
  },
  async (req, res, next) => {
    if (req.master) return next()
    let mid = parseInt(req.params.mid)
    let query = 'SELECT "cid", "psid" FROM "message" WHERE "mid" = $1 AND "to" IS NULL'
    let ret = (await db.query(query, [mid])).rows[0]
    if (!ret) return res.sendStatus(hsc.badReq)
    let { cid, psid } = ret
    if (cid) return mtc.course(req.tokenAcc.uid, cid)
    if (psid) return mtc.problemset(req.tokenAcc.uid, psid)
    return res.sendStatus(hsc.forbidden)
  },
  async (req, res) => {
    let { title, content, del } = req.body
    let mid = parseInt(req.params.mid)
    let query = 'UPDATE "message" SET "when" = NOW()::TIMESTAMPTZ, "title" = $1, "content" = $2, "from_del" = $3 WHERE "mid" = $4 AND "to" IS NULL RETURNING "cid", "psid", "mid", "title", "content", "when" AS "time", "from_del" AS "del"'
    let ret = (await db.query(query, [title, content, del, mid])).rows[0]
    if (!ret) return res.sendStatus(hsc.badReq)
    return res.status(hsc.ok).json(ret)
  }
)

router.get('/total', lc,
  async (req, res, next) => {
    if (!(req.tokenAcc.permission >= 1)) return res.sendStatus(hsc.forbidden)
    return next()
  },
  async (req, res) => {
    let query = 'SELECT COUNT(*) FROM "message" WHERE "to" IS NULL'
    let ret = (await db.query(query, [mid])).rows[0]
    if (!ret) return res.sendStatus(hsc.badReq)
    let { count } = ret
    return res.status(hsc.ok).json(count)
  }
)

router.get('/', lc,
  async (req, res, next) => {
    if (!(req.tokenAcc.permission >= 1)) return res.sendStatus(hsc.forbidden)
    return next()
  },
  async (req, res) => {
    let page = parseInt(req.query.page), item = parseInt(req.query.item)
    let limit = item, offset = (page - 1) * item
    let query = 'SELECT "cid", "psid", "mid", "title", "content", "when" AS "time", "from_del" AS "del" WHERE "to" IS NULL ORDER BY "mid" DESC'
    let param = []
    if (limit > 0) {
      query += ` LIMIT $${param.push(limit)}`
      if (offset >= 0) query += ` OFFSET $${param.push(offset)}`
    }
    let ret = (await db.query(query, param)).rows
    return res.status(hsc.ok).json(ret)
  }
)

export default router
