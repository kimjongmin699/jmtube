import multer from 'multer'

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn)
  res.locals.loggedInUser = req.session.user || {}
  res.locals.siteName = 'jmTube'
  next()
}

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next()
  } else {
    req.flash('error', 'Not authorized')
    return res.redirect('/login')
  }
}

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next()
  } else {
    req.flash('error', 'Not authorized')
    return res.redirect('/')
  }
}

export const avatarUpload = multer({
  dest: 'uploads/avatars/',
  limits: {
    fileSize: 4000000,
  },
})
export const videoUpload = multer({
  dest: 'uploads/videos/',
  limits: {
    fileSize: 250000000,
  },
})
