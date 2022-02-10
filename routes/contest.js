let { get, getOpen, router } = require('./problemset')
let lc = require('./midwares/login-check')
router.get('/', lc,
  async (req, res, next) => {
    req.params.cid = 0
    return next()
  },
  get('contest'))
router.get('/open', lc,
  async (req, res, next) => {
    req.params.cid = 0
    return next()
  },
  getOpen('contest'))
router.get('/global', lc, get('contest'))
router.get('/global/open', lc, getOpen('contest'))
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
