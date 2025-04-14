import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

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

const update = async (columnId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    // Gọi tới Model để lưu dữ liệu bản ghi newBoard vào Database
    const updatedColumn = await columnModel.update(columnId, updateData)

    // Trả về dữ liệu cho Controller, luôn dữ liệu về cho Controller
    return updatedColumn
  } catch (error) { throw error }
}

const deleteItem = async (columnId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    // Xoá Column
    await columnModel.deleteOneById(columnId)

    // Xóa Card trong Column
    await cardModel.deleteManyByColumnId(columnId)

    // Xoá ColumnId trong mảng columnOrderIds của Board
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: 'Columns and its Cards deleted successfully!' }
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}
