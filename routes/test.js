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

module.exports = router
