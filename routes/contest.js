let { getAll, get, getOpen, router } = require('./problemset')
let lc = require('./midwares/login-check')
router.get('/', lc, getAll('contest'))
router.get('/open', lc, getOpen('contest'))
router.get('/global', lc, get('contest'))
router.get('/course(s)?/:cid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  get('contest'))
router.get('/course(s)?/:cid(\\d+)/open', lc,
  async (req, res, next) => {
    return (mc['course'](req.tokenAcc.uid, req.params.cid)(req, res, next))
  },
  getOpen('contest'))
module.exports = router
