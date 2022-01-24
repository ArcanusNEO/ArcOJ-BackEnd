let tokenUtils = require('../../utils/token')
let hsc = require('../../config/http-status-code')

module.exports = (req, res, next) => {
  try {
    req.tokenAcc = tokenUtils.get(req, 'acc')
    return next()
  } catch (err) {
    console.error(err)
    return res.sendStatus(hsc.unauthorized)
  }
}
