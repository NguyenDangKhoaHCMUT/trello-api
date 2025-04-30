import { env } from '~/config/environment'

// Những domain được phép truy cập vào API của chúng ta
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173'
  // Không cần localhost nữa vì ở file cors.js đã luôn luôn cho phép môi trường dev
  'https://trello-web-omega-weld.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT