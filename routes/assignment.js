let { getAll, getBanner, router } = require('./problemset')
let lc = require('./midwares/login-check')
router.get('/', lc,)
router.get('/open', lc,)
router.get('/global', lc,)
router.get('/course/:cid(\\d+)', lc,)
router.get('/course/:cid(\\d+)/open', lc,)
module.exports = router
