import tokenUtils from '../../utils/token.mjs'
import hsc from '../../config/http-status-code.mjs'

export default (req, res, next) => {
  try {
    req.tokenAcc = tokenUtils.get(req, 'acc')
  } catch (err) {
    console.error(err)
    return res.sendStatus(hsc.unauthorized)
  }
  return next()
}
