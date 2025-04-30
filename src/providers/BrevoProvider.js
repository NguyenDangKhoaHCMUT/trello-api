// https://github.com/getbrevo/brevo-node

const brevo = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new brevo.TransactionalEmailsApi()

let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY


const sendEmail = (email, customSubject, htmlContent) => {
  let sendSmtpEmail = new brevo.SendSmtpEmail()

  // Tài khoản gửi mail: lưu ý địa chỉ admin email phải là cái email mà các bạn tạo tài khoản trên Brevo
  sendSmtpEmail.sender = {
    name: env.ADMIN_EMAIL_NAME,
    email: env.ADMIN_EMAIL_ADDRESS
  }

  sendSmtpEmail.subject = customSubject
  sendSmtpEmail.htmlContent = htmlContent
  // Những tài khoản nhận email
  // 'to' phải là 1 array để sau chúng ta có thể tùy biến gửi 1 email tới nhiều user tùy tính năng dự án
  sendSmtpEmail.to = [{ email: email }]

  apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}
