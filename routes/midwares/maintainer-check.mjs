import mtcrb from './maintainer-check-ret-bool.mjs'
import hsc from '../../config/http-status-code.mjs'

const problem = (uid, pid) => {
  return async (req, res, next) => {
    if (mtcrb.problem(uid, pid)) return next()
    return res.sendStatus(hsc.forbidden)
  }
}

const problemset = (uid, psid) => {
  return async (req, res, next) => {
    if (mtcrb.problemset(uid, psid)) return next()
    return res.sendStatus(hsc.forbidden)
  }
}

const course = (uid, cid) => {
  return async (req, res, next) => {
    if (mtcrb.course(uid, cid)) return next()
    return res.sendStatus(hsc.forbidden)
  }
}

export default {
  problem,
  problemset,
  course
}
