import mode from '../../config/strict-mode.mjs'

export default () => {
  if (mode.enable) return mode.code
  console.log('Strict mode off')
  return false
}
