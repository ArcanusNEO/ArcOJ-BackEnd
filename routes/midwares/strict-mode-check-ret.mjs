import fs from 'fs-extra'

export default async () => {
  try {
    let file = await fs.readFile('../../config/strict-mode.json', 'utf8')
    let mode = JSON.parse(file)
    if (!mode || !mode.enable) throw Error('Strict mode off')
    return mode.code
  } catch (err) {
    console.error(err)
  }
  return false
}
