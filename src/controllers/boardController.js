import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'This is a custom error message!')
    // res.status(StatusCodes.CREATED).json({
    //   message: 'POST from Controller: API create new boards',
    //   status: StatusCodes.CREATED
    // })
  } catch (error) { next(error) }
}

export const boardController = {
  createNew
}
