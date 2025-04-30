import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

// Middleware này sẽ đảm nhiệm việc quan trọng: xác thực cái JWT accessToken nhận được phía FE có hợp lệ hay không
const isAuthorize = async (req, res, next) => {
  // Lấy accessToken trong request cookies phía client - withCredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken

  // Nếu như clientAccessToken không tồn tại => trả về lỗi
  if (!clientAccessToken) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorize! (Token not found)')
    )
    return
  }

  try {
    // Bước 01: Thực hiện giải mã token xem nó có hợp lệ hay là không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    // Bước 02: Quan trọng: Nếu như cái token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được vào cái req.
    // jwtDecoded, để sử dụng cho các tầng cần xử lý ở phía sau
    req.jwtDecoded = accessTokenDecoded

    // Bước 03: Cho phép cái request đi tiếp
    next()
  } catch (error) {
    // console.log('🚀 ~ isAuthorize ~ error:', error)
    // Nếu cái accessToken nó bị hết hạn (expired) thì mình cần trả về một cái mã lỗi 410-GONE cho phía FE biết để gọi
    // api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token!'))
      return
    }

    // Nếu như cái accessToken nó không lợp lệ do bất kỳ điều gì khác vụ hết hạn thì chúng ta cứ thẳng tay trả
    // về mã 401 cho phía FE gọi api sign_out luôn
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorize!')
    )
  }
}

export const AuthMiddleware = {
  isAuthorize
}
