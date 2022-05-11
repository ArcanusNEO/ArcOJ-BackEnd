import smcr from './strict-mode-check-ret.mjs'
import fc from './form-check.mjs'
import ecrb from './examing-check-ret-bool.mjs'
import hsc from '../../config/http-status-code.mjs'

const o = {
  passcodeFormChk: (req, res, next) => {
    req.passcode = smcr()
    if (!req.passcode) return next()
    return fc(['body'], ['passcode'])(req, res, next)
  },
  passcodeChk: (req, res, next) => {
    if (!req.passcode) return next()
    if (req.passcode === req.body.passcode) return next()
    return res.sendStatus(hsc.forbidden)
  },
  examingChk: async (req, res, next) => {
    let examing = await ecrb(req.tokenAcc.uid)
    if (examing) return next()
    return res.sendStatus(hsc.forbidden)
  },
  passcodeForbid: (req, res, next) => {
    if (smcr()) return res.sendStatus(hsc.forbidden)
    return next()
  }
}
export default o