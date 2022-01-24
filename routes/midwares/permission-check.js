let permdef = require('../../config/permission')
let db = require('../../utils/database')
let hsc = require('../../config/http-status-code')

module.exports = (uid, reqPerms) => {
  return async (req, res, next) => {
    let query = 'SELECT "perm" FROM "user" INNER JOIN "group" ON "user"."gid" = "group"."gid" WHERE "user"."uid" = $1'
    let ret = (await db.query(query, [uid])).rows[0]['perm']
    let rep = true
    reqPerms.forEach((reqPerm) => {
      let bit = ret.substr(permdef[reqPerm], 1)
      if (bit !== '1') { rep = false }
    });
    if (rep) {
      return next()
    } else {
      return res.sendStatus(hsc.forbidden)
    }
  }
}
