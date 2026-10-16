import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const createdCard = await cardService.createNew(req.body)

    // Có kết quả thì trả về cho Client (cái tạm thời sẽ hiển thị ra Postman)
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    // Lấy ID từ URL
    const cardId = req.params.id
    // Lấy dữ liệu cần update từ body
    const updateData = req.body

    // Gọi tới Service
    const updatedCard = await cardService.update(cardId, updateData)
    // Trả kết quả về cho Client
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  update
}
