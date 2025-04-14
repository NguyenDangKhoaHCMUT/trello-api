import { slugify } from '~/utils/formater'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới Model để lưu dữ liệu bản ghi newBoard vào Database
    const createdBoard = await boardModel.createNew(newBoard)
    // console.log('createdBoard: ', createdBoard)

    // Lấy bản ghi Board sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    // console.log('getNewBoard: ', getNewBoard)

    // Làm thêm các xử lý logic khác với các Colection khác tùy vào đặc thù dự án
    // Bắn email, notification, ...về cho admin khi có 1 cái board mới được tạo, ...

    // Trả về dữ liệu cho Controller, luôn dữ liệu về cho Controller
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // Gọi tới Model để lưu dữ liệu bản ghi newBoard vào Database
    const board = await boardModel.getDetails(boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Deep Clone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu,
    // tùy mục đích về sau mà có cần clone hay không (video 63 sẽ giải thích)
    const resBoard = cloneDeep(board)
    // Đưa card về đúng column của nó
    resBoard.columns.forEach((column) => {
      // Lưu ý: card.columnId là ObjectId nên cần chuyển về string để so sánh với column._id
      // Cách 1: dùng hàm toString() của JavaScript để chuyển ObjectId về string
      // column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())
      // Cách 2: cách dùng .equals() này là bởi vì chúng ta hiểu ObjectId trong MongoDB có support method .equals()
      column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id))
    })

    // Xóa đi các thuộc tính không cần thiết (xóa mảng cards khỏi board ban đầu)
    delete resBoard.cards

    // Trả về dữ liệu cho Controller, luôn dữ liệu về cho Controller
    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    // Gọi tới Model để lưu dữ liệu bản ghi newBoard vào Database
    const updatedBoard = await boardModel.update(boardId, updateData)

    // Trả về dữ liệu cho Controller, luôn dữ liệu về cho Controller
    return updatedBoard
  } catch (error) { throw error }
}


/**
   * Khi di chuyển Card sang Column khác:
   * B1: Cập nhật lại mảng cardOrderIds của Columnn ban đầu chứa nó (hiểu bản chất là xóa
   * cái _id của Card trong mảng cardOrderIds của Column ban đầu)
   *
   * B2: Cập nhật lại mảng cardOrderIds của Columnn mới chứa nó (hiểu bản chất là thêm
   * cái _id của Card vào mảng cardOrderIds của Column mới)
   *
   * B3: Cập nhật lại trường columnId mới của cái Card đã kéo
   *
   * => Làm một API support riêng
   */
const moveCardToDifferentColumn = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })

    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })

    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: Date.now()
    })
    return { updateResult: 'Successfully!' }
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
}
