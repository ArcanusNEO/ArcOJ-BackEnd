import dataPath from '../config/basic.mjs'
import fs from 'fs-extra'
import PQueue from 'p-queue'
import defalutConfig from '../config/judge-config-default.mjs'
import db from './database.mjs'
import jsc from '../config/judge-status-code.mjs'
import spawnPkg from './spawn.mjs'
import pqConcurrency from '../config/judgecore-concurrency.mjs'

const { spawn } = spawnPkg
const queue = new PQueue(pqConcurrency)

const getSolutionStructure = (sid) => {
  const pathSolution = `${dataPath.solution}/${sid}`
  const pathTemp = `${pathSolution}/temp`
  const pathExecOut = `${pathSolution}/execout`

  const fileResult = `${pathTemp}/result`
  const fileTime = `${pathTemp}/time`
  const fileMemory = `${pathTemp}/memory`
  const fileDetail = `${pathTemp}/detail`
  const fileCompileInfo = `${pathSolution}/main.cmpinfo`
  const fileCodeBase = `${pathSolution}/main.`
  return {
    path: {
      solution: pathSolution,
      temp: pathTemp,
      execOut: pathExecOut
    },
    file: {
      result: fileResult,
      time: fileTime,
      memory: fileMemory,
      detail: fileDetail,
      compileInfo: fileCompileInfo,
      codeBase: fileCodeBase
    }
  }
}

const getProblemStructure = (pid) => {
  const pathData = `${dataPath.problemData}/${pid}`
  const pathSpj = `${dataPath.problemSpj}/${pid}`
  const fileMd = `${dataPath.problem}/${pid}.md`
  const filePdf = `${dataPath.problem}/${pid}.pdf`
  const spjBase = `${pathSpj}/main.`
  return {
    path: {
      problem: dataPath.problem,
      data: pathData,
      spj: pathSpj
    },
    file: {
      md: fileMd,
      pdf: filePdf,
      spjBase: spjBase
    }
  }
}

const genConfig = (params) => {
  let config = defalutConfig
  config['sid'] = params.sid
  config['filename'] = params.filename
  config['lang'] = params.lang
  config['pid'] = params.pid
  config['max_time'] = params.timeLimit
  config['max_memory'] = params.memoryLimit
  config['continue_on'] = params.detailJudge ? true : ["accepted", "presentation error"]
  config['test_case_count'] = params.cases
  config['spj_mode'] = params.specialJudge
  return config
}

const judge = async (params) => {
  return queue.add(async () => { return judgecore(params) })
}

const judgecore = async (params) => {
  let { sid, pid, langExt, lang, code, cases, specialJudge, detailJudge, timeLimit, memoryLimit } = params
  let struct = getSolutionStructure(sid)
  await fs.ensureDir(struct.path.solution)
  let filename = `main.${langExt}`
  let config = genConfig({ sid, filename, lang, pid, timeLimit, memoryLimit, detailJudge, cases, specialJudge })
  await fs.writeFile(`${struct.path.solution}/main.${langExt}`, code)
  await fs.writeFile(`${struct.path.solution}/exec.config`, JSON.stringify(config))
  try {
    await spawn('docker', ['exec', '-i', 'judgecore', './judgecore', `${struct.path.solution}/exec.config`])
    let json = JSON.parse(await fs.readFile(`${struct.path.execOut}/result.json`, { encoding: 'utf8' }))

    let time = json.time
    let memory = json.memory

    let acCount = 0
    if (json.detail) {
      if (detailJudge) json.status = 0
      json.detail.forEach((i) => {
        i.extra = i.extra || json.extra
        if (i.status === 0 || i.status === 1) acCount += 1
        json.status = Math.max(json.status, i.status)
      })
    }
    let statusMap = [jsc.msgCode.AC, jsc.msgCode.PE, jsc.msgCode.WA, jsc.msgCode.CE, jsc.msgCode.RE, jsc.msgCode.MLE, jsc.msgCode.TLE, jsc.msgCode.OLE, jsc.msgCode.FL, jsc.msgCode.SE]
    let result = statusMap[json.status]
    let score = parseInt(acCount * 100.0 / cases)
    let sqlStr = 'UPDATE "solution" SET "status_id" = $1, "run_time" = $2, "run_memory" = $3, "detail" = $4, "compile_info" = $5, "score" = $6 WHERE "sid" = $7'
    await db.query(sqlStr, [result, time, memory, JSON.stringify(json.detail).replace(/\u\d\d\d\d/gms, match => '\\' + match), json.compiler, score, sid])
    // if (score >= 100) {
    //   let query = 'UPDATE "problem" SET "submit_ac" = "submit_ac" + 1 WHERE "pid" = $1'
    //   await db.query(query, [pid])
    // }
    // 这里不需要更新submit_ac，UPDATE solution会触发触发器自动判断score更新
  } catch (err) {
    console.error(err)
    let sqlStr = 'UPDATE "solution" SET "status_id" = $1 WHERE "sid" = $2'
    try {
      await db.query(sqlStr, [jsc.msgCode.CE, sid])
    } catch (e) {
      console.error(e)
    }
    return false
  }
  return true
}

const spj = async (params) => {
  let { pid, spjLang, spjLangExt, spjCode } = params
  let struct = getProblemStructure(pid)
  let spjFile = struct.file.spjBase + spjLangExt
  await fs.writeFile(spjFile, spjCode)
  let config = { 'lang': spjLang, 'pid': `${pid}` }
  let configFile = struct.file.spjBase + 'config'
  await fs.writeFile(configFile, JSON.stringify(config))
  let { code: exitCode, stdout, stderr } = await spawn('docker', ['exec', '-i', 'judgecore', './compiler', configFile]).catch(err => {
    console.error(err)
    return { ok: false }
  })
  return { ok: (exitCode === 0), exitCode, stdout, stderr }
}

export default {
  getSolutionStructure,
  getProblemStructure,
  judge,
  spj
}
