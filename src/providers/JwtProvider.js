// https://www.npmjs.com/package/jsonwebtoken
import JWT from 'jsonwebtoken'


/**
 * Function tạo mới 1 token - cần 3 tham số đầu vào
 * userInfo: Những thông tin muốn đính kèm vào token
 * secretSignature: Chữ kí bí mật (dạng một chuỗi string ngẫu nhiên) trên docs của jsonwebtoken thì để tên là privateKey tùy
 * đều được
 * tokenLife: thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Hàm sign của jsonwebtoken, thuật toán mặc định nếu k khai báo thì sẽ là HS256
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Function kiểm tra một token có hợp lệ hay không
 * Hợp lệ ở đây hiểu đơn giản là cái token được tạo ra có đúng với cái chữ kí bí mật secretSignature trong dự án hay không
 */
const verifyToken = async (token, secretSignature) => {
  try {
    // Hàm verify của jsonwebtoken
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}


export const JwtProvider = {
  generateToken,
  verifyToken
}
