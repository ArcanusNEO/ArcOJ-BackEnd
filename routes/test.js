let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let fileUpload = require('express-fileupload')
let fs = require('fs-extra')
let dirs = require('../config/basic')
let path = require('path')

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
