let { getAll, get, getOpen, router } = require('./problemset')
let lc = require('./midwares/login-check')
router.get('/', lc, getAll('assignment'))
router.get('/open', lc, getOpen('assignment'))
router.get('/global', lc, get('assignment'))
router.get('/course(s)?/:cid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  get('assignment'))
router.get('/course(s)?/:cid(\\d+)/open', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  getOpen('assignment'))
module.exports = router
