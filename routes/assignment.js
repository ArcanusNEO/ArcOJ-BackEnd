const { get, getOpen, getDetail } = require('./problemset')
const express = require('express')
const router = express.Router()
const lc = require('./midwares/login-check')
const mc = require('./midwares/member-check')

router.get('/', lc,
  async (req, res, next) => {
    req.params.cid = 0
    return next()
  },
  get('assignment'))
router.get('/open', lc,
  async (req, res, next) => {
    req.params.cid = 0
    return next()
  },
  getOpen('assignment'))
router.get('/global', lc, get('assignment'))
router.get('/global/open', lc, getOpen('assignment'))
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

router.get('/id/:psid(\\d+)', lc,
  async (req, res, next) => {
    return (mc['problemset'](req.tokenAcc.uid, req.params.psid)(req, res, next))
  }, getDetail)
module.exports = router
