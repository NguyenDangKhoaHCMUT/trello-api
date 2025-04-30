import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ms from 'ms'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const createdUser = await userService.createNew(req.body)

    // Có kết quả thì trả về cho Client
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { next(error) }
}

const verifyAccount = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const result = await userService.verifyAccount(req.body)

    // Có kết quả thì trả về cho Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const login = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const result = await userService.login(req.body)

    /**
    * Xử lý trả về http only cookie cho phía trình duyệt
    * Về cái maxAge và thư viện ms: https://expressjs.com/en/api.html
    * Đối với cái maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày, tùy dự án. Lưu ý
    thời gian sống của cookie khác với cái thời gian sống của token nhé. Đừng bị nhầm lẫn :D
    */
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days') // giống định dạng trên docs
    })
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days') // giống định dạng trên docs
    })

    // Có kết quả thì trả về cho Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const logout = async (req, res, next) => {
  try {
    // Xóa cookie - đơn giản là làm ngược lại so với việc gán cookie ở login
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res. status(StatusCodes. OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken (req.cookies?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days') // giống định dạng trên docs
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! (Error from refresh Token)'))
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken
}
