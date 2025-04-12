import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // throw new ApiError(StatusCodes.BAD_REQUEST, 'This is a custom error message!')

    // Điều hướng dữ liệu sang tầng Service
    const createdBoard = await boardService.createNew(req.body)

    // Có kết quả thì trả về cho Client (cái tạm thời sẽ hiển thị ra Postman)
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id

    // Điều hướng dữ liệu sang tầng Service
    // Sau này ở khóa Mern Stack Advanced nâng cao học trực tiếp sẽ có thêm userId nữa để chỉ lấy board thuộc về
    // user đó thôi chẳng hạn
    const board = await boardService.getDetails(boardId)

    // Có kết quả thì trả về cho Client (cái tạm thời sẽ hiển thị ra Postman)
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

export const boardController = {
  createNew,
  getDetails
}
