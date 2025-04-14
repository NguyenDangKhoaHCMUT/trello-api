/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Những domain được phép truy cập vào API của chúng ta
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173'
  // Không cần localhost nữa vì ở file cors.js đã luôn luôn cho phép môi trường dev
  'https://trello-web-omega-weld.vercel.app/'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}