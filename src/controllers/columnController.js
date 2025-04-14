import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const createdColumn = await columnService.createNew(req.body)

    // Có kết quả thì trả về cho Client (cái tạm thời sẽ hiển thị ra Postman)
    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const columnId = req.params.id

    // Điều hướng dữ liệu sang tầng Service
    // Sau này ở khóa Mern Stack Advanced nâng cao học trực tiếp sẽ có thêm userId nữa để chỉ lấy board thuộc về
    // user đó thôi chẳng hạn
    const updatedColumn = await columnService.update(columnId, req.body)

    // Có kết quả thì trả về cho Client (cái tạm thời sẽ hiển thị ra Postman)
    res.status(StatusCodes.OK).json(updatedColumn)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const columnId = req.params.id

    // Điều hướng dữ liệu sang tầng Service
    // Sau này ở khóa Mern Stack Advanced nâng cao học trực tiếp sẽ có thêm userId nữa để chỉ lấy board thuộc về
    // user đó thôi chẳng hạn
    const result = await columnService.deleteItem(columnId)

    // Có kết quả thì trả về cho Client (cái tạm thời sẽ hiển thị ra Postman)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}
export const columnController = {
  createNew,
  update,
  deleteItem
}
