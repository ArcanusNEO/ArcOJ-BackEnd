import db from '../../utils/database.mjs'
import hsc from '../../config/http-status-code.mjs'

const problemset = (uid, psid) => {
  return async (req, res, next) => {
    let query = 'SELECT "uid" FROM "problemset_user" WHERE "uid" = $1 AND "psid" = $2 LIMIT 1'
    let ret = (await db.query(query, [uid, psid])).rows[0]
    if (ret) return next()
    return res.sendStatus(hsc.forbidden)
  }
}

const course = (uid, cid) => {
  return async (req, res, next) => {
    let query = 'SELECT "uid" FROM "course_user" WHERE "uid" = $1 AND "cid" = $2 LIMIT 1'
    let ret = (await db.query(query, [uid, cid])).rows[0]
    if (ret) return next()
    return res.sendStatus(hsc.forbidden)
  }
}

export default {
  problemset,
  course
}
