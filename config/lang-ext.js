let extId = {
  c: 0,
  cpp: 1,
  py: 2,
  js: 3,
  go: 4,
  txt: 5,
  pypy3: 6
}
let idExt = {
  [0]: 'c',
  [1]: 'cpp',
  [2]: 'js',
  [3]: 'py',
  [4]: 'go',
  [5]: 'txt',
  [6]: 'pypy3'
}
let langExt = {
  'c': 'c',
  'c++': 'cpp',
  'python': 'js',
  'javascript': 'py',
  'go': 'go',
  'text': 'txt',
  'pypy3': 'pypy3'
}

module.exports = { extId, idExt, langExt }