import permdef from '../../config/permission.mjs'
import db from '../../utils/database.mjs'
import hsc from '../../config/http-status-code.mjs'

export default (uid, reqPerms) => {
  return async (req, res, next) => {
    let query = 'SELECT "perm" FROM "user" INNER JOIN "group" ON "user"."gid" = "group"."gid" WHERE "user"."uid" = $1'
    let ret = (await db.query(query, [uid])).rows[0]['perm']
    let rep = true
    for (let reqPerm of reqPerms) {
      let bit = ret.substr(permdef[reqPerm], 1)
      if (bit !== '1') {
        rep = false
        break
      }
    }
    if (rep) return next()
    return res.sendStatus(hsc.forbidden)
  }
}
