let path = require('path')
let data = require('./path')

for (let p in data) {
  if (p === 'dataBase') continue
  data[p] = path.resolve(data.dataBase, data[p])
}

module.exports = data