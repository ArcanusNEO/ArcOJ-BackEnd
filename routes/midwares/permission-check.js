const permdef = require('../../config/permission')
const db = require('../../utils/database')
const hsc = require('../../config/http-status-code')

module.exports = (uid, reqPerms) => {
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
