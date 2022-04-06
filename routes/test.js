const express = require('express')
const router = express.Router()
const hsc = require('../config/http-status-code')
const db = require('../utils/database')
const { getProblemStructure } = require('../utils/judge')
const fs = require('fs-extra')
const fileUpload = require('express-fileupload')
const path = require('path')
const compressing = require("compressing")
const dataPath = require('../config/basic')
const jsc = require('../config/judge-status-code')
const langMap = require('../config/lang-ext')


router.get('/', async (req, res) => {
  return res.end('Powered by Lucas and Wans.')
})

router.get('/id/:pid(\\d+)/statistics',
  async (req, res) => {
    let pid = parseInt(req.params.pid)
    let query = 'SELECT DISTINCT ON ("solution"."uid") "solution"."pid", "problem"."title", "solution"."sid", "solution"."uid", "user"."email" AS "email", "user"."nickname", "user"."realname", "solution"."score", "solution"."status_id" AS "status", "solution"."lang_id" AS "lang", "solution"."code_size" AS "codeSize (B)", "solution"."run_time" AS "time (ms)", "solution"."run_memory" AS "memory (KiB)" FROM "problem" INNER JOIN "solution" ON "problem"."pid" = "solution"."pid" INNER JOIN "user" ON "solution"."uid" = "user"."uid" WHERE "solution"."pid" = $1 ORDER BY "solution"."uid" ASC, "solution"."score" DESC, "solution"."sid" DESC'
    let ret = (await db.query(query, [pid])).rows
    for (let row of ret) {
      row.status = jsc.codeMsg[row.status]
      row.lang = langMap.idLang[row.lang]
    }
    res.status(hsc.ok).json(ret)
  }
)

module.exports = router
