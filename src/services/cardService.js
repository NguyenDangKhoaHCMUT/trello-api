import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newCard = {
      ...reqBody
    }

    // Gọi tới Model để lưu dữ liệu bản ghi newCard vào Database
    const createdCard = await cardModel.createNew(newCard)

    // Lấy bản ghi Card sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng columnOrderIds trong collection boards
      await columnModel.pushCardOrderIds(getNewCard)
    }

    // Trả về dữ liệu cho Controller, luôn dữ liệu về cho Controller
    return getNewCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew
}
