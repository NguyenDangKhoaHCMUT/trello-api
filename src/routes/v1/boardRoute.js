import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'

import { AuthMiddleware } from '~/middlewares/AuthMiddleware'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({
      message: 'GET: API get list boards',
      status: StatusCodes.OK
    })
  })
  .post(AuthMiddleware.isAuthorize, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(AuthMiddleware.isAuthorize, boardController.getDetails)
  .put(AuthMiddleware.isAuthorize, boardValidation.update, boardController.update)

// API hỗ trợ di chuyển Card giữa các Column trong cùng một Board
Router.route('/supports/moving_cards')
  .put(AuthMiddleware.isAuthorize, boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)


export const boardRoute = Router
