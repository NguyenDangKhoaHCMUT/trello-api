/**
 * YouTube: TrungQuanDev - Một Lập Trình Viên
 * Created by trungquandev.com's author on Sep 27, 2023
 */
/**
 * Simple method to Convert a String to Slug
 * Các bạn có thể tham khảo thêm kiến thức liên quan ở đây: https://byby.dev/js-slugify-string
 */
import { pick } from 'lodash'
export const slugify = (val) => {
  if (!val) return ''
  return String(val)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/đ/gi, 'd')
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// const originalStringTest = 'Nguyễn Đăng Khoa Một Lập Trình Viên'
// const slug = slugify(originalStringTest)

// console.log('originalStringTest:', originalStringTest)
// console.log('slug:', slug)

// Lấy một vài dữ liệu cụ thể trong User để tránh việc trả về các dữ liệu nhạy cảm như hash password
export const pickUser = (user) => {
  if (!user) return {}
  return pick(user, ['_id', 'email', 'username', 'displayName', 'avatar', 'role', 'isActive', 'createdAt', 'updatedAt'])
}