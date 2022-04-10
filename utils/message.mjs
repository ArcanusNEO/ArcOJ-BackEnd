import db from './database.mjs'
const sendMessage = async (to, title, content) => {
  return db.query('INSERT INTO messages (a, b, title, content) VALUES (NULL, $1, $2, $3) RETURNING *', [to, title, content])
}
export default {
  sendMessage
}
