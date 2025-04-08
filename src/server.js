import express from 'express'

const app = express()

const hostname = 'localhost'
const port = 1170

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.listen(port, hostname, () => {
  console.log(`Hello Nguyen Dang Khoa, I am running server at http://${hostname}:${port}/`)
})