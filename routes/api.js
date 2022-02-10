let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')

router.use('/admin', require('./admin'))
router.use('/announcement(s)?', require('./announcement'))
router.use('/assignment(s)?', require('./assignment'))
router.use('/contest(s)?', require('./contest'))
router.use('/course(s)?', require('./course'))
router.use('/email-captcha', require('./email-captcha'))
router.use('/judge', require('./judge'))
router.use('/login', require('./login'))
router.use('/logout', require('./logout'))
router.use('/problem(s)?', require('./problem'))
router.use('/reset', require('./reset'))
router.use('/signup', require('./signup'))
router.use('/u(ser(s)?)?', require('./user'))
router.use('/test', require('./test'))

router.all('*', (req, res) => {
  res.sendStatus(hsc.notFound)
})

module.exports = router
