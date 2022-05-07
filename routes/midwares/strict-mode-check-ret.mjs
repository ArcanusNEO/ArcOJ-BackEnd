import fs from 'fs-extra'
import basic from '../../config/basic.mjs'
import path from 'path'

export default async () => {
  try {
    let file = await fs.readFile(path.resolve(basic.dataBase, 'strict-mode.json'), 'utf8')
    let mode = JSON.parse(file)
    if (!mode || !mode.enable) throw Error('Strict mode off')
    return mode.code
  } catch (err) {
    console.error(err)
  }
  return false
}
