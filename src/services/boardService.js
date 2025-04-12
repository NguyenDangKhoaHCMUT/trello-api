import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formater'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới Model để lưu dữ liệu bản ghi newBoard vào Database

    // Làm thêm các xử lý logic khác với các Colection khác tùy vào đặc thù dự án
    // Bắn email, notification, ...về cho admin khi có 1 cái board mới được tạo, ...

    // Trả về dữ liệu cho Controller, luôn dữ liệu về cho Controller
    return newBoard
  } catch (error) { throw error }
}

export const boardService = {
  createNew
}
