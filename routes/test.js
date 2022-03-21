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

router.get('/:pid(\\d+)', async (req, res) => {
  let pid = parseInt(req.params.pid)
  try {
    let problemData = getProblemStructure(pid).data
    await fs.ensureDir(dataPath.temp)
    let ioDataTmp = path.resolve(dataPath.temp, `${pid}.zip`)
    await compressing.zip.compressDir(problemData, ioDataTmp)
    return res.download(ioDataTmp, (err) => {
      console.error(err)
      // fs.unlink(ioDataTmp, (fserr) => { console.error(fserr) })
    })
  } catch (err) {
    console.error(err)
    return res.sendStatus(hsc.unauthorized)
  }
})

router.get('/', async (req, res) => {
  return res.download('/var/www/data/problems-data/18/1.in')
})

module.exports = router
