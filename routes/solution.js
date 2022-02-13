let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let db = require('../utils/database')
let lc = require('./midwares/login-check')
let mc = require('./midwares/member-check')

router.get('/id/:sid(\\d+)', lc, async (req, res) => {

})

module.exports = router