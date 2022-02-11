let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let fileUpload = require('express-fileupload')
let fs = require('fs-extra')
let dirs = require('../config/basic')

router.use(fileUpload({
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }
}))

router.post('/', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) return res.sendStatus(hsc.badReq)
  await fs.ensureDir(dirs.public)
  await req.files.sampleFile.mv(dirs.public)
  return res.sendStatus(hsc.ok)
})

module.exports = router
