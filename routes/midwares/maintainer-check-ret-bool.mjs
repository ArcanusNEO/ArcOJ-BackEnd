import db from '../../utils/database.mjs'

const problem = async (uid, pid) => {
  let query = 'SELECT "owner_id" = $1 AS "own" FROM "problem" WHERE "pid" = $2'
  let ret = (await db.query(query, [uid, pid])).rows[0]
  if (!ret) return false
  if (ret.own) return true
  query = 'SELECT "uid" FROM "problem_maintainer" WHERE "uid" = $1 AND "pid" = $2 LIMIT 1'
  ret = (await db.query(query, [uid, pid])).rows[0]
  return (ret ? true : false)
}

const problemset = async (uid, psid) => {
  let query = 'SELECT "owner_id" = $1 AS "own" FROM "problemset" WHERE "psid" = $2'
  let ret = (await db.query(query, [uid, psid])).rows[0]
  if (!ret) return false
  if (ret.own) return true
  query = 'SELECT "uid" FROM "problemset_maintainer" WHERE "uid" = $1 AND "psid" = $2 LIMIT 1'
  ret = (await db.query(query, [uid, psid])).rows[0]
  return (ret ? true : false)
}

const course = async (uid, cid) => {
  let query = 'SELECT "owner_id" = $1 AS "own" FROM "course" WHERE "cid" = $2'
  let ret = (await db.query(query, [uid, cid])).rows[0]
  if (!ret) return false
  if (ret.own) return true
  query = 'SELECT "uid" FROM "course_maintainer" WHERE "uid" = $1 AND "cid" = $2 LIMIT 1'
  ret = (await db.query(query, [uid, cid])).rows[0]
  return (ret ? true : false)
}

export default {
  problem,
  problemset,
  course
}
