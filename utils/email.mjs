import nodemailer from 'nodemailer'
import info from '../config/email.mjs'

const transporter = nodemailer.createTransport(info.transportInfo)

const sendEmail = async (address, content) => {
  info.mailInfo['to'] = address
  info.mailInfo['text'] = content
  try {
    let ret = await transporter.sendMail(info.mailInfo)
    console.log("邮件成功发送: %s", ret.messageId)
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}

export default sendEmail