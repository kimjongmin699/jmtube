import express from 'express'
import {
  finishGithubLogin,
  getChangePassword,
  getUserEdit,
  logout,
  postChangePassword,
  postUserEdit,
  seeUser,
  startGithubLogin,
} from '../controllers/userController'
import {
  avatarUpload,
  protectorMiddleware,
  publicOnlyMiddleware,
} from '../middlewares'

const userRouter = express.Router()

userRouter.get('/:id([0-9a-f]{24})', seeUser)
userRouter
  .route('/edit')
  .get(getUserEdit)
  .all(protectorMiddleware)
  .post(avatarUpload.single('avatar'), postUserEdit)
userRouter.get('/logout', logout)
userRouter.get('/github/start', publicOnlyMiddleware, startGithubLogin)
userRouter.get('/github/finish', publicOnlyMiddleware, finishGithubLogin)
userRouter
  .route('/change-password')
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword)

export default userRouter
