import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  /**
   * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì vì để cho FE tự validate
   * và custom message cho người dùng
   * BE chỉ cần validate đảm bảo dữ liệu chuẩn xác, và trả về message mặc định từ thư viện là được:
   * Quan trọng: Việc validate dữ liệu Bắt Buộc phải có ở phía BE vì đây là điểm cuối để lưu trữ dữ liệu
   * vào Database
   * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở cả 2 phía BE và FE
   */
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
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
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    columnOrderIds: Joi.array().items(
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

const moveCardToDifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),

    prevColumnId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    prevCardOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).required(),

    nextColumnId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    nextCardOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).required()
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

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumn
}