/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from './config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  app.use(express.json()) // Middleware để parse JSON body từ client gửi lên

  // Uses API v1
  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`3. Hello ${env.AUTHOR}, BE server is running successfully at hostname: ${ env.APP_HOST } and port: ${ env.APP_PORT }/`)
  })

  // Khi server BE tắt thì sẽ gọi hàm này
  // HIỆN VẪN CHƯA DÙNG ĐƯỢC
  exitHook(() => {
    console.log('BE server is shutting down...')
    CLOSE_DB()
    console.log('Closed MongoDB connection!')
  })
}

// Chỉ khi kết nối tới Database thành công thì mới start server BE lên
// Immediately Invoked Function Expression (IIFE) để gọi hàm CONNECT_DB
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')

    START_SERVER()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(0)
  }
})()

// Chỉ khi kết nối tới Database thành công thì mới start server BE lên
// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB Cloud Atlas!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error('Error connecting to MongoDB:', error)
//     process.exit(0)
//   })
