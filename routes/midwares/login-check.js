const tokenUtils = require('../../utils/token')
const hsc = require('../../config/http-status-code')

module.exports = (req, res, next) => {
  try {
    req.tokenAcc = tokenUtils.get(req, 'acc')
  } catch (err) {
    console.error(err)
    return res.sendStatus(hsc.unauthorized)
  }
  return next()
}
