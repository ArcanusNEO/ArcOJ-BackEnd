let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')

router.use('/announcement', require('./admin/announcement'))
router.use('/assignment', require('./admin/assignment'))
router.use('/contest', require('./admin/contest'))
router.use('/course', require('./admin/course'))
router.use('/problem', require('./admin/problem'))
router.use('/user', require('./admin/user'))

router.get('*', (req, res) => {
  res.sendStatus(hsc.notFound)
})

module.exports = router
