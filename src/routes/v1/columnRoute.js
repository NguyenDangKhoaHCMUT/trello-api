import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'

import { AuthMiddleware } from '~/middlewares/AuthMiddleware'

const Router = express.Router()

Router.route('/')
  .post(AuthMiddleware.isAuthorize, columnValidation.createNew, columnController.createNew)

Router.route('/:id')
  .put(AuthMiddleware.isAuthorize, columnValidation.update, columnController.update)
  .delete(AuthMiddleware.isAuthorize, columnValidation.deleteItem, columnController.deleteItem)

export const columnRoute = Router
