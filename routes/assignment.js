let { getAll, router } = require('./problemset')
let lc = require('./midwares/login-check')
router.get('/', lc, getAll('assignment'))
module.exports = router
