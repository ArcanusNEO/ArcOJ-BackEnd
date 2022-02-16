const express = require('express')
const router = express.Router()
const hsc = require('../config/http-status-code')
const tokenUtils = require('../utils/token')

router.get('/', (req, res) => {
  tokenUtils.remove(res, 'acc')
  res.sendStatus(hsc.ok)
})

module.exports = router
