const dataPath = require('../config/basic')
const fs = require('fs-extra')
const defalutConfig = require('../config/judge-config-default')
const db = require('./database')
const jsc = require('../config/judge-status-code')
const { spawn } = require('./spawn')

const getSolutionStructure = async (sid) => {
  const pathSolution = `${dataPath.solution}/${sid}`
  await fs.ensureDir(pathSolution)
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
      exec_out: pathExecOut
    },
    file: {
      result: fileResult,
      time: fileTime,
      memory: fileMemory,
      detail: fileDetail,
      compile_info: fileCompileInfo,
      code_base: fileCodeBase
    }
  }
}

const getProblemStructure = (pid) => {
  const pathData = `${dataPath.problemData}/${pid}`
  const pathSpj = `${dataPath.problemSpj}/${pid}`
  const fileMd = `${dataPath.problem}/${pid}.md`
  return {
    path: {
      problem: dataPath.problem,
      data: pathData,
      spj: pathSpj
    },
    file: {
      md: fileMd
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
  let { sid, pid, langExt, lang, code, cases, specialJudge, detailJudge, timeLimit, memoryLimit } = params
  let struct = getSolutionStructure(sid)
  let filename = `main.${langExt}`
  let config = genConfig({ sid, filename, lang, pid, timeLimit, memoryLimit, detailJudge, cases, specialJudge })
  await fs.writeFile(`${struct.path.solution}/main.${langExt}`, code)
  await fs.writeFile(`${struct.path.solution}/exec.config`, JSON.stringify(config))
  try {
    await spawn('docker', ['exec', '-i', 'judgecore', './judgecore', `${struct.path.solution}/exec.config`])
    let json = JSON.parse(await fs.readFile(`${struct.path.exec_out}/result.json`, { encoding: 'utf8' }))

    let statusMap = [jsc.msgCode.AC, jsc.msgCode.PE, jsc.msgCode.WA, jsc.msgCode.CE, jsc.msgCode.RE, jsc.msgCode.MLE, jsc.msgCode.TLE, jsc.msgCode.OLE, jsc.msgCode.FL, jsc.msgCode.SE]
    let result = statusMap[json.status]

    let time = json.time
    let memory = json.memory

    let acCount = 0
    if (json.detail) {
      json.detail.forEach((i) => {
        i.extra = i.extra || json.extra
        if (i.status === 0 || i.status === 1) acCount += 1
      })
    }
    let score = parseInt(acCount * 100.0 / cases)
    let sqlStr = 'UPDATE "solution" SET "status_id" = $1, "run_time" = $2, "run_memory" = $3, "detail" = $4, "compile_info" = $5, "score" = $6 WHERE "sid" = $7'
    await db.query(sqlStr, [result, time, memory, JSON.stringify(json.detail).replace(/\u\d\d\d\d/gms, match => '\\' + match), json.compiler, score, sid])
  } catch (err) {
    console.error(err)
    let sqlStr = 'UPDATE "solution" SET "status_id" = $1 WHERE "sid" = $7'
    try {
      await db.query(sqlStr, [jsc.msgCode.CE, sid])
    } catch (e) {
      console.error(e)
    }
    return err
  }
  return 0
}

module.exports = {
  getSolutionStructure,
  getProblemStructure,
  judge,
  async unlinkTempFolder(sid) {
    await fs.unlink(getSolutionStructure(sid).path.temp + '/main')
  }
}
