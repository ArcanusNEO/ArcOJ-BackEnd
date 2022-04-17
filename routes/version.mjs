import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import db from '../utils/database.mjs'
import judgecore from '../utils/judge.mjs'
const { getProblemStructure } = judgecore
import fs from 'fs-extra'
import fileUpload from 'express-fileupload'
import path from 'path'
import compressing from "compressing"
import dataPath from '../config/basic.mjs'
import jsc from '../config/judge-status-code.mjs'
import langMap from '../config/lang-ext.mjs'


router.get('/', async (req, res) => {
  return res.end('Powered by Lucas and Wans.')
})

router.get('/mem', async (req, res) => {
  return res.json(process.memoryUsage())
})

export default router
