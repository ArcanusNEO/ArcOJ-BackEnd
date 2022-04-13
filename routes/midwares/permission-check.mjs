import pcrb from './permission-check-ret-bool.mjs'
import hsc from '../../config/http-status-code.mjs'

export default (uid, reqPerms) => {
  return async (req, res, next) => {
    if (await pcrb(uid, reqPerms)) return next()
    return res.sendStatus(hsc.forbidden)
  }
}
