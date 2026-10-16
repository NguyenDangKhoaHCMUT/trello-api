import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // Dữ Liệu comments của Card chúng ta sẽ học cách nhúng - embedded vào bản ghi Card luôn như dưới đây:
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    //Chỗ này lưu ý vì dùng hàm $push để thêm comment nên không set default Date.now luôn giông hàm
    //insertOne khi create được.
    commentedAt: Joi.date().timestamp()
  }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
    // Chỉ định abortEarly là false để tất cả các lỗi đều được trả về
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    // Validate dữ liệu đầu vào
    const validatedData = await validateBeforeCreate(data)
    // Biến đổi 1 số dữ liệu liên quan đến Id chuẩn chỉnh
    const newCardToAdd = {
      ...validatedData,
      boardId: new ObjectId(validatedData.boardId),
      columnId: new ObjectId(validatedData.columnId)
    }
    const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd)
    return createdCard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (cardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(cardId)
    })
    return result
  } catch (error) { throw new Error(error) }
}


// Danh sách các field không được phép update trong hàm update
const INVALID_UPDATE_FIELD = ['_id', 'boardId', 'createdAt']

const update = async (cardId, updateData) => {
  try {
    // Validate dữ liệu đầu vào
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELD.includes(fieldName)) {
        delete updateData[fieldName] // Xóa các field không được phép update
      }
    })

    // Đối với những dữ liệu liên quan đến ObjectID, biến đổi ở đây
    // (tùy sau này cần mà tách ra func riêng hay không)
    if (updateData.columnId) {
      updateData.columnId = new ObjectId(updateData.columnId)
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: updateData },
      { returnDocument: 'after' } // Sẽ trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
      columnId: new ObjectId(columnId)
    })
    // console.log("🚀 ~ deleteManyByColumnId ~ result:", result)
    return result
  } catch (error) { throw new Error(error) }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId
}