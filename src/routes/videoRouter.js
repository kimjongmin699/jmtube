import express from 'express'
import {
  deleteVideo,
  getEdit,
  getUpload,
  postEdit,
  postUpload,
  removeVideo,
  seeVideo,
} from '../controllers/videoController'
import { protectorMiddleware, videoUpload } from '../middlewares'

const videoRouter = express.Router()

videoRouter
  .route('/upload')
  .all(protectorMiddleware)
  .get(getUpload)
  .post(videoUpload.single('video'), postUpload)
videoRouter.route('/:id([0-9a-f]{24})').get(seeVideo)
//videoRouter.get('/:id(\\d+)', seeVideo)
videoRouter
  .route('/:id([0-9a-f]{24})/edit')
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit)
// videoRouter.get('/:id(\\d+)/edit', getEdit)
// videoRouter.post('/:id(\\d+)/edit', postEdit)
videoRouter
  .route('/:id([0-9a-f]{24})/delete')
  .all(protectorMiddleware)
  .get(deleteVideo)

export default videoRouter
