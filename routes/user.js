let express = require('express')
let router = express.Router()
let hsc = require('../config/http-status-code')
let tokenUtils = require('../utils/token')
let lc = require('./midwares/login-check')

router.get('/', lc, (req, res) => {
  try {
    let tokenAcc = req.tokenAcc
    let account = {
      uid: tokenAcc['uid'],
      username: tokenAcc['username'].split('@', 1)[0],
      nickname: tokenAcc['nickname'],
      permission: tokenAcc['permission']
    }
    res.status(hsc.ok).json(account)
  } catch (err) {
    console.error(err)
    res.sendStatus(hsc.unauthorized)
  }
})

module.exports = router
