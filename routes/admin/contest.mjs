import express from 'express'
const router = express.Router()
import hsc from '../../config/http-status-code.mjs'

router.get('/', (req, res) => {
  res.sendStatus(hsc.notFound)
})

export default router
