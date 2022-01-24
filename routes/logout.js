let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let tokenUtils = require('../utils/token')

router.get('/', (req, res) => {
  tokenUtils.remove(res, 'acc')
  res.sendStatus(hsc.ok)
})

module.exports = router
