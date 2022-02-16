const express = require('express')
const router = express.Router()
const hsc = require('../../config/http-status-code')

router.get('/', (req, res) => {
  res.sendStatus(hsc.notFound)
})

module.exports = router
