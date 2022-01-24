let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')

router.get('/', (req, res) => {
  res.sendStatus(hsc.notFound)
})

module.exports = router
