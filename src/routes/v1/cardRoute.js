import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'

import { AuthMiddleware } from '~/middlewares/AuthMiddleware'

const Router = express.Router()

Router.route('/')
  .post(AuthMiddleware.isAuthorize, cardValidation.createNew, cardController.createNew)

Router.route('/:id')
  .put(AuthMiddleware.isAuthorize, cardValidation.update, cardController.update)

export const cardRoute = Router
