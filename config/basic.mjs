import path from 'path'
import data from './path.mjs'

for (let p in data) {
  if (p === 'dataBase') continue
  data[p] = path.resolve(data.dataBase, data[p])
}

export default data