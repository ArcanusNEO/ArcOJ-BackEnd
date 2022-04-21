import problem from './problemset.mjs'
const { get, getOpen, getDetail } = problem
import express from 'express'
const router = express.Router()
import lc from './midwares/login-check.mjs'
import mc from './midwares/member-check.mjs'

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

router.get('/id/:psid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  }, getDetail)
export default router