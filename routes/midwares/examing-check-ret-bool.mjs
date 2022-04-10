import db from '../../utils/database.mjs'

export default async (uid) => {
  let query = `SELECT COUNT(*) FROM "problemset" INNER JOIN "problemset_user" ON "problemset"."psid" = "problemset_user"."psid" WHERE "problemset_user"."uid" = $1 AND NOW()::TIMESTAMPTZ <@ "problemset"."during" AND "problemset"."type" <> 'assignment'`
  let ret = (await db.query(query, [uid])).rows[0].count
  return (ret > 0)
}

