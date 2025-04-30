import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'

// Define tạm 2 role cho user, tùy việc mở rộng dự án như thế nào mà có thể thêm role tùy ý sao cho phù hợp sau
const USER_ROLE = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

// Define Collection (name & schema)
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),

  // Useename cắt ra từ email sẽ có khả năng không unique bởi vì sẽ có những tên email trùng nhau nhưng
  // từ các nhà cung cấp email khác nhau

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLE.CLIENT, USER_ROLE.ADMIN).default(USER_ROLE.CLIENT),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),


  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Danh sách các field không được phép update trong hàm update
const INVALID_UPDATE_FIELD = ['_id', 'email', 'username', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    // Validate dữ liệu đầu vào
    const validatedData = await validateBeforeCreate(data)

    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validatedData)
    return createdUser
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      email: (emailValue)
    })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (userID, updateData) => {
  try {
    // Validate dữ liệu đầu vào
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELD.includes(fieldName)) {
        delete updateData[fieldName] // Xóa các field không được phép update
      }
    })

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userID) },
      { $set: updateData },
      { returnDocument: 'after' } // Sẽ trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  USER_ROLE,
  createNew,
  findOneById,
  findOneByEmail,
  update
}