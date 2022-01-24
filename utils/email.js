let nodemailer = require('nodemailer')
let info = require('../config/email')

let transporter = nodemailer.createTransport(info.transportInfo)

let sendEmail = async (address, content) => {
  info.mailInfo['to'] = address
  info.mailInfo['text'] = content
  try {
    let ret = await transporter.sendMail(info.mailInfo)
    console.log("邮件成功发送: %s", ret.messageId)
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

module.exports = sendEmail