/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'

// Tạo 1 đối tượng trelloDatabaseInstance ban đầu là null (vì chúng ta chưa connect)
let trelloDatabaseInstance = null

// Tạo 1 đối tượng mongoClientInstance để kết nối tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // Lưu ý cái serverApi có từ phiên bản MongoDB 5.0.0 trở lên, có thể không cần dùng nó, còn nếu dùng nó là chúng
  // ta chỉ định một cái Stable API Version của MongoDB (video 47)
  // https://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối tới Database
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của mongoClientInstance
  await mongoClientInstance.connect()

  // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến trelloDatabaseInstance ở trên
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

// Function GET_DB (không async) này có nhiệm vụ export ra cai Trello Database Instance sau khi đã connect thành công
// tới MongoDB để chúng ra sử dụng ở nhiều nơi khác nhau trong code
// Lưu ý phải đảm bảo chỉ luong gọi cái getDB này sau khi đã connect thành công tới MongoDB
export const GET_DB = () => {
  // Nếu chưa kết nối thì gọi hàm connect
  if (!trelloDatabaseInstance) {
    throw new Error('Must connect to Database first!')
  }

  // Trả về đối tượng trelloDatabaseInstance
  return trelloDatabaseInstance
}

// Hàm này dùng để close kết nối tới MongoDB
export const CLOSE_DB = async () => {
  // Nếu chưa kết nối thì gọi hàm connect
  if (!trelloDatabaseInstance) {
    throw new Error('Must connect to Database first!')
  }

  // Đóng kết nối tới MongoDB
  await mongoClientInstance.close()
}