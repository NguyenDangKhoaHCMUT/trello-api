import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'

import { AuthMiddleware } from '~/middlewares/AuthMiddleware'

const Router = express.Router()

Router.route('/')
  .post(AuthMiddleware.isAuthorize, cardValidation.createNew, cardController.createNew)

export const cardRoute = Router
