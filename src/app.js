// Azure Application Insights discover and rapidly diagnose performance and other issues.
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

const { port = 8000 } = require('./config')
app.use(cors())
app.use(require('morgan')('dev'))

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json({ limit: '100mb' }))

const routes = require('./routes')

app.use('/', routes)

const server = app.listen(port, '0.0.0.0')
console.info(`Running on http://localhost:${port}`)

module.exports = server
