const extId = {
  c: 0,
  cpp: 1,
  py: 2,
  js: 3,
  go: 4,
  txt: 5,
  pypy3: 6
}
const idExt = {
  [0]: 'c',
  [1]: 'cpp',
  [2]: 'py',
  [3]: 'js',
  [4]: 'go',
  [5]: 'txt',
  [6]: 'pypy3'
}
const langExt = {
  'c': 'c',
  'c++': 'cpp',
  'python': 'py',
  'javascript': 'js',
  'go': 'go',
  'text': 'txt',
  'pypy3': 'pypy3'
}

module.exports = { extId, idExt, langExt }