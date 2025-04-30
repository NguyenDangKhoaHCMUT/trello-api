import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute.js'
import { columnRoute } from './columnRoute.js'
import { cardRoute } from './cardRoute.js'
import { userRoute } from './userRoute.js'

const Router = express.Router()

// Check APIs v1/status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'APIs V1 are ready to use!',
    status: StatusCodes.OK
  })
})

// Board APIs
Router.use('/boards', boardRoute)
// Board APIs
Router.use('/columns', columnRoute)
// Board APIs
Router.use('/cards', cardRoute)

// User APIS
Router.use('/users', userRoute)

export const APIs_V1 = Router