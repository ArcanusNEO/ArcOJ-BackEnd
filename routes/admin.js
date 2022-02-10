let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')

router.use('/announcement(s)?', require('./admin/announcement'))
router.use('/assignment(s)?', require('./admin/assignment'))
router.use('/contest(s)?', require('./admin/contest'))
router.use('/course(s)?', require('./admin/course'))
router.use('/problem(s)?', require('./admin/problem'))
router.use('/u(ser(s)?)?', require('./admin/user'))

router.get('*', (req, res) => {
  res.sendStatus(hsc.notFound)
})

module.exports = router
