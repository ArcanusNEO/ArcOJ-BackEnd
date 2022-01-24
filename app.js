let express = require('express')
let path = require('path')
let cookieParser = require('cookie-parser')
let logger = require('morgan')
let hsc = require('./config/http-status-code')

let api = require('./routes/api')

let app = express()

app.all('*', (req, res, next) => {
  res.header("Server", "Microsoft-IIS/7.0")
  res.header("X-AspNet-Version", "4.0.30319")
  res.header("X-Powered-By", ["ASP.NET", "ARR/2.5"]) //:)
  //res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
  res.header("Content-Type", "application/json;charset=utf-8")
  next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger(':date[iso] :remote-addr :method :url :status'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', api)

app.use((req, res) => {
  res.sendStatus(hsc.notFound)
})

module.exports = app
