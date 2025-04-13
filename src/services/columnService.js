import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newColumn = {
      ...reqBody
    }

    // Gọi tới Model để lưu dữ liệu bản ghi newColumn vào Database
    const createdColumn = await columnModel.createNew(newColumn)

    // Lấy bản ghi Column sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      getNewColumn.cards = []

      // Cập nhật mảng columnOrderIds trong collection boards
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    // Trả về dữ liệu cho Controller, luôn dữ liệu về cho Controller
    return getNewColumn
  } catch (error) { throw error }
}

export const columnService = {
  createNew
}
