import pgPkg from 'pg'
const { Pool } = pgPkg
import config from '../config/postgres.mjs'
const db = {}
const pool = new Pool(config)

pool.query('SELECT NOW() as now', (err, res) => {
  if (err) console.error('Database connected error.', err)
  else console.log(`Database connected at ${res.rows[0].now}`)
})

db.query = (text, params) => {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    'use strict'
    pool.query(text, params, (err, res) => {
      const end = Date.now() - start
      if (err) {
        console.error(`Database query [${text}, ${params}] failed in ${end} ms`)
        console.error(err)
        reject(err)
      } else {
        console.log(`Database query [${text}, ${params}] finished in ${end} ms`)
        resolve(res)
      }
    })
  })
}

export default db