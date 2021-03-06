import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import db from '../utils/database.mjs'
import judgecore from '../utils/nku-judgecore.mjs'
const { getProblemStructure } = judgecore
import fs from 'fs-extra'
import fileUpload from 'express-fileupload'
import path from 'path'
import compressing from "compressing"
import dataPath from '../config/basic.mjs'
import jsc from '../config/judge-status-code.mjs'
import langMap from '../config/lang-ext.mjs'
import smcr from './midwares/strict-mode-check-ret.mjs'
const dirname = path.dirname
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
import lc from './midwares/login-check.mjs'

router.get('/strict-mode', (req, res) => {
  let code = smcr()
  return res.status(hsc.ok).json({enable: (code ? true : false)})
})

router.get('/', (req, res) => {
  return res.end('Powered by Lucas and Wans.')
})

router.get('/mem', lc, (req, res) => {
  return res.json(process.memoryUsage())
})

router.get('/ip', lc, (req, res) => {
  return res.end(req.ip)
})

router.get('/fortune', async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" })
  return res.end(await fs.readFile(path.join(__dirname, '../public/fortune.html')))
})

export default router
