const express = require('express')
const router = express.Router()
const hsc = require('../../config/http-status-code')

router.use('/announcement(s)?', require('./announcement'))
router.use('/assignment(s)?', require('./assignment'))
router.use('/contest(s)?', require('./contest'))
router.use('/course(s)?', require('./course'))
router.use('/problem(s)?', require('./problem'))
router.use('/u(ser(s)?)?', require('./user'))

router.get('*', (req, res) => {
  res.sendStatus(hsc.notFound)
})

module.exports = router
