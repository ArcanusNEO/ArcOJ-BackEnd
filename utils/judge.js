const { SOLUTION_PATH, DATA_BASE, PROBLEM_DATA_PATH, PROBLEM_SPJ_PATH, PROBLEM_PATH } = require('../config/basic')
const fs = require('fs-extra')
const defalutConfig = require('../config/judge-config-default')
const db = require('./database')
const languageExtension = require('../config/lang-ext')
const jsc = require('../config/judge-status-code')
const { spawn } = require('./spawn')

const getSolutionStructure = async (sid) => {
  const PATH_SOLUTION = `${SOLUTION_PATH}/${sid}`
  await fs.ensureDir(PATH_SOLUTION)
  const PATH_TEMP = `${PATH_SOLUTION}/temp`
  const PATH_EXEC_OUT = `${PATH_SOLUTION}/execout`

  const FILE_RESULT = `${PATH_TEMP}/result`
  const FILE_TIME = `${PATH_TEMP}/time`
  const FILE_MEMORY = `${PATH_TEMP}/memory`
  const FILE_DETAIL = `${PATH_TEMP}/detail`
  const FILE_COMPILE_INFO = `${PATH_SOLUTION}/main.cmpinfo`
  const FILE_CODE_BASE = `${PATH_SOLUTION}/main.`
  return {
    path: {
      solution: PATH_SOLUTION,
      temp: PATH_TEMP,
      exec_out: PATH_EXEC_OUT
    },
    file: {
      result: FILE_RESULT,
      time: FILE_TIME,
      memory: FILE_MEMORY,
      detail: FILE_DETAIL,
      compile_info: FILE_COMPILE_INFO,
      code_base: FILE_CODE_BASE
    }
  }
}

const getProblemStructure = (pid) => {
  const PATH_DATA = `${PROBLEM_DATA_PATH}/${pid}`
  const PATH_SPJ = `${PROBLEM_SPJ_PATH}/${pid}`
  const FILE_MD = `${PROBLEM_PATH}/${pid}.md`
  return {
    path: {
      data: PATH_DATA,
      spj: PATH_SPJ
    },
    file: {
      md: FILE_MD
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
      json.detail.forEach(function (i) {
        i.extra = i.extra || json.extra
        if (i.status === 0 || i.status === 1)
          acCount += 1
      })
    }
    let score = parseInt(acCount * 100.0 / cases)
    let sqlStr = 'UPDATE "solution" SET "status_id" = $1, "run_time" = $2, "run_memory" = $3, "detail" = $4, "compile_info" = $5, "score" = $6 WHERE "sid" = $7'
    await db.query(sqlStr, [result, time, memory, JSON.stringify(json.detail).replace(/\u\d\d\d\d/gms, match => '\\' + match), json.compiler, score, sid])
    return 0
  } catch (err) {
    console.error(err)
    let sqlStr = 'UPDATE "solution" SET "status_id" = $1 WHERE "sid" = $7'
    await db.query(sqlStr, [jsc.msgCode.CE, sid]).then(() => { }).catch((e) => { console.error(e) })
    return err
  }
}

module.exports = {
  getSolutionStructure,
  getProblemStructure,
  judge,
  async unlinkTempFolder(sid) {
    await fs.unlink(getSolutionStructure(sid).path.temp + '/main')
  }
}
