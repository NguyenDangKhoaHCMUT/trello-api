import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, {
    // Chỉ định abortEarly là false để tất cả các lỗi đều được trả về
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    // Validate dữ liệu đầu vào
    const validatedData = await validateBeforeCreate(data)
    // Biến đổi 1 số dữ liệu liên quan đến Id chuẩn chỉnh
    const newColumnToAdd = {
      ...validatedData,
      boardId: new ObjectId(validatedData.boardId)
    }
    const createdColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newColumnToAdd)
    return createdColumn
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) { throw new Error(error) }
}

// Nhiệm vụ của hàm này là push 1 cái giá trị cardId vào cuối mảng cardOrderIds trong collection columns
const pushCardOrderIds = async (card) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(card.columnId) },
      { $push: { cardOrderIds: new ObjectId(card._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

// Danh sách các field không được phép update trong hàm update
const INVALID_UPDATE_FIELD = ['_id', 'boardId', 'createdAt']

const update = async (columnId, updateData) => {
  try {
    // Validate dữ liệu đầu vào
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELD.includes(fieldName)) {
        delete updateData[fieldName] // Xóa các field không được phép update
      }
    })
    // Đối với những dữ liệu liên quan đến ObjectID, biến đổi ở đây
    // (tùy sau này cần mà tách ra func riêng hay không)
    if (updateData.cardOrderIds) {
      updateData.cardOrderIds = updateData.cardOrderIds.map((_id) => new ObjectId(_id))
    }
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(columnId) },
      { $set: updateData },
      { returnDocument: 'after' } // Sẽ trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}


const deleteOneById = async (columnId) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(columnId)
    })
    // console.log("🚀 ~ deleteOneById ~ result:", result)
    return result
  } catch (error) { throw new Error(error) }
}

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
  update,
  deleteOneById
}