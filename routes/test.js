const express = require('express')
const router = express.Router()
const hsc = require('../config/http-status-code')
const fileUpload = require('express-fileupload')
const fs = require('fs-extra')
const dirs = require('../config/basic')
const path = require('path')

router.use(fileUpload({
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 } // 10K
}))

router.post('/', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) return res.sendStatus(hsc.badReq)
  await fs.ensureDir(dirs.public)
  let sampleFile = req.files.sampleFile
  await sampleFile.mv(path.resolve(dirs.public, "1.txt"))
  return res.sendStatus(hsc.ok)
})

module.exports = router
