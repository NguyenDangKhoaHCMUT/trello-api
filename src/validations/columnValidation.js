import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, {
      // Chỉ định abortEarly là false để tất cả các lỗi đều được trả về
      abortEarly: false
    })
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang Controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    )
    next(customError)
  }
}

const update = async (req, res, next) => {
  // Lưu ý chúng ta không required trong trường hợp update
  const correctCondition = Joi.object({
    // Nếu cần làm tính năng di chuyển column sang board khác thì bỏ comment dòng dưới
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    await correctCondition.validateAsync(req.body, {
      // Chỉ định abortEarly là false để tất cả các lỗi đều được trả về
      abortEarly: false,
      // Đối với TH update, cho phép Unknown để không cần đẩy một số field không cần thiết vào
      allowUnknown: true
    })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    )
    next(customError)
  }
}

const deleteItem = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.params)
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    )
    next(customError)
  }
}

export const columnValidation = {
  createNew,
  update,
  deleteItem
}