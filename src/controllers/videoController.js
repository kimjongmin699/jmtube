import User from '../models/User'
import Video from '../models/Video'
import Comment from '../models/Comment'

// const handleSearch = (error, videos) => {
//   console.log('error', error)
//   console.log('videos', videos)
// }

export const trending = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createdAt: 'desc' })
      .populate('owner') //asc
    return res.render('home', { pageTitle: 'Home', videos })
  } catch (error) {
    return res.render('server-error', { error })
  }
}

export const seeVideo = async (req, res) => {
  const { id } = req.params
  const video = await Video.findById(id).populate('owner').populate('comments')
  // const owner = await User.findById(video.owner)
  console.log(video)
  if (!video) {
    return res.render('404', { pageTitle: 'Video not found' })
  }
  return res.render('watch', { pageTitle: video.title, video })
}

export const getEdit = async (req, res) => {
  const { id } = req.params
  const video = await Video.findById(id)
  if (!video) {
    return res.render('404', { pageTitle: 'Video not found' })
  }
  if (String(video.owner) !== String(req.session.user._id)) {
    req.flash('error', 'Not authorized')
    return res.status(400).redirect('/')
  }
  return res.render('edit', { pageTitle: 'Edit Video', video })
}
export const postEdit = async (req, res) => {
  const { id } = req.params
  const { title, description, hashtags } = req.body
  const video = await Video.exists({ _id: id }) //true, false를 return
  if (!video) {
    return res.render('404', { pageTitle: 'Video not found' })
  }
  if (String(video.owner) !== String(req.session.user._id)) {
    return res.status(400).redirect('/')
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  })
  // video.title = title
  // video.description = description
  // video.hashtags = hashtags
  //   .split(',')
  //   .map((word) => (word.startsWith('#') ? word : `#${word}`))
  // await video.save()
  return res.redirect(`/videos/${id}`)
}

export const deleteVideo = async (req, res) => {
  const { id } = req.params
  const {
    user: { _id },
  } = req.session
  const video = await Video.findById(id)
  if (!video) {
    return res.render('404', { pageTitle: 'Video not found' })
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(400).redirect('/')
  }
  await Video.findByIdAndDelete(id)
  return res.redirect('/')
}

export const getUpload = (req, res) => {
  return res.render('upload', { pageTitle: 'Upload Video' })
}
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session
  const file = req.file
  const { title, description, hashtags } = req.body
  try {
    const newVideo = await Video.create({
      owner: _id,
      title,
      fileUrl: file.location,
      description,
      hashtags: Video.formatHashtags(hashtags),
    })
    const user = await User.findById(_id)
    user.videos.push(newVideo._id)
    user.save()
    return res.redirect('/')
  } catch (error) {
    console.log(error)
    return res.status(404).render('upload', {
      pageTitle: 'Upload Video',
      errorMessage: error._message,
    })
  }

  // const dbVideo = await video.save()
  //console.log(dbVideo)
}

export const search = async (req, res) => {
  const { keyword } = req.query
  let videos = []
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, 'i'),
      },
    }).populate('owner')
  }
  res.render('search', { pageTitle: 'Search', videos })
}

export const registerView = async (req, res) => {
  const { id } = req.params
  const video = await Video.findById(id)
  if (!video) {
    return res.sendStatus(404)
  }
  video.meta.views = video.meta.views + 1
  await video.save()
  return res.sendStatus(200)
}

export const createComment = async (req, res) => {
  // console.log(req.body)
  // console.log(req.params)
  // console.log(req.session)
  // return res.end()
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req

  const video = await Video.findById(id).populate('comments')
  if (!video) {
    return res.sendStatus(404)
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  })
  video.comments.push(comment._id)
  video.save()
  console.log('comments', video.comments)
  console.log(video.comments.map((comment) => comment.createdAt))
  return res.status(201).json({ newCommentId: comment._id })
}
