import { slugify } from '~/utils/formater'
import { boardModel } from '~/models/boardModel'

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

export const boardService = {
  createNew
}
