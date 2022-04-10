import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import tokenUtils from '../utils/token.mjs'

router.get('/', (req, res) => {
  tokenUtils.remove(res, 'acc')
  res.sendStatus(hsc.ok)
})

export default router
