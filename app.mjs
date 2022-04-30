import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import hsc from './config/http-status-code.mjs'

import api from './routes/api.mjs'

const app = express()

app.set('trust proxy', true) // nginx反向代理正确显示ip

app.all('*', (req, res, next) => {
  res.header("Server", "Microsoft-IIS/7.0")
  res.header("X-AspNet-Version", "4.0.30319")
  res.header("X-Powered-By", ["ASP.NET", "ARR/2.5"]) //:)
  //res.header("Access-Control-Allow-Credentials", true)
  // res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  res.header("Content-Type", "application/json;charset=utf-8")
  next()
})

// view engine setup
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'ejs')

app.use(logger(':date[iso] :remote-addr :method :url :status'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// app.use(express.static(path.join(__dirname, 'public')))

app.use('/', api)

app.use((req, res) => {
  res.sendStatus(hsc.notFound)
})

export default app
