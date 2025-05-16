import { userModel } from '~/models/userModel'
import { BrevoProvider } from '~/providers/BrevoProvider'

import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

import { pickUser } from '~/utils/formater'

import { WEBSITE_DOMAIN } from '~/utils/constants'

import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống của chúng ta hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exist!')
    }

    // Tạo data để lưu vào database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // Tham số thứ 2 giá trị càng cao thì băm mk càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail, // Mặc định để giống username khi người dùng đki mới, về sau làm thêm tính năng update cho user
      verifyToken: uuidv4()
    }

    // Thực hiện lưu thông tin user vào database
    // Gọi tới Model để lưu dữ liệu bản ghi newUser vào Database
    const createdUser = await userModel.createNew(newUser)

    // Lấy bản ghi Board sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject =
      'Trello: Please verify your email before using our services!'
    const htmlContent = `
      <h3> Here is your vertification link:</h3>
      <h3> ${verificationLink}</h3>
      <h3> Sincerely,</h3>
      <h3><strong> Nguyen Dang Khoa.</strong></h3>
    `

    // Gọi tới Provider gửi email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // trả về dữ liệu cho phía controller
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    // Query user trong dbs
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Account has been activated!'
      )
    if (reqBody.token !== existUser.verifyToken)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')

    // Nếu mọi thứ đều oke, tiến hành update lại thông tin của user để verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(existUser._id, updateData)

    // trả về dữ liệu cho phía controller
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    // Query user trong dbs
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Các bước kiểm tra cần thiết
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Account has not been activated! Check the email and verify before login!'
      )
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your Email or Password is incorrect!'
      )
    }

    // Nếu mọi thứ đều oke, tiến hành tạo token đăng nhập để trả về cho FE
    // Tạo thông tin để đính kèm trong JWT bao gồm _id và email của user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      // 15
    )

    // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify/giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )
    // console.log('🚀 ~ refreshToken ~ refreshTokenDecoded:', refreshTokenDecoded)

    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra,
    // tiết kiệm query vào DB để lấy data mới
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo acccessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query user và kiểm tra cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    if (!existUser.isActive) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Account has not been activated! Check the email and verify before login!'
      )
    }

    // Khởi tạo kết quả updated user ban đầu là empty
    let updatedUser = {}

    // TH change password
    if (reqBody.current_password && reqBody.new_password) {
      // Kiểm tra xem cái current_password có đúng hay không
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          'Your Current Password is incorrect!'
        )
      }
      // Nếu như current_password đúng thì hash lại 1 cái mk mới và update lại vào DB
      updatedUser = await userModel.update(userId, {
        password: bcryptjs.hashSync(reqBody.current_password, 8) // Tham số thứ 2 giá trị càng cao thì băm mk càng lâu
      })
    } else if (userAvatarFile) {
      // Trường hợp update file lên Cloud Storage, cụ thể là Cloudinary...
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, `users/${userId}`)

      // Lưu lại URL của cái file ảnh đã được up lên Cloudinary vào database
      updatedUser = await userModel.update(userId, {
        avatar: uploadResult.secure_url
      })
    } else {
      // Trường hợp update các thông tin chung, ví dụ như displayName
      updatedUser = await userModel.update(userId, reqBody)
    }

    return pickUser(updatedUser)
  }
  catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}