import User from '../models/User'
import bcrypt from 'bcrypt'
import fetch from 'node-fetch'
import Video from '../models/Video'
//front에서는 fetch사용가능하나, server에서는 불가능
//그래서 server에서 fetch사용 위해 import함.

export const getJoin = (req, res) => {
  return res.render('createAccount', { pageTitle: 'Create Account' })
}

export const postJoin = async (req, res) => {
  const { email, username, password, password2, location, name } = req.body
  const exists = await User.exists({ $or: [{ username }, { email }] })
  if (password !== password2) {
    return res.status(400).render('createAccount', {
      pageTitle: 'Create Account',
      errorMessage: 'Password does not match.',
    })
  }
  if (exists) {
    return res.status(400).render('createAccount', {
      pageTitle: 'Create Account',
      errorMessage: 'This username/email is already taken',
    })
  }
  //   const emailExists = await User.exists({ email: email })
  //   if (emailExists) {
  //     return res.render('createAccount', {
  //       pageTitle: 'Create Account',
  //       errorMessage: 'This Email is already taken',
  //     })
  //   }
  try {
    await User.create({
      email,
      username,
      name,
      location,
      password,
    })
    return res.redirect('/login')
  } catch (error) {
    return res.status(400).render('createAccount', {
      pageTitle: 'Create Account',
      errorMessage: error._message,
    })
  }
}

export const getLogin = (req, res) => {
  res.render('login', { pageTitle: 'Login' })
}
export const postLogin = async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username, socialOnly: false })
  if (!user) {
    return res.status(400).render('login', {
      pageTitle: 'Login',
      errorMessage: 'Username does not exist.',
    })
  }
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    return res.status(400).render('login', {
      pageTitle: 'Login',
      errorMessage: 'Wrong Password',
    })
  }
  //session에 아래 항목을 저장시킴.
  req.session.loggedIn = true
  req.session.user = user
  res.redirect('/')
}

export const startGithubLogin = (req, res) => {
  const baseUrl = 'https://github.com/login/oauth/authorize'
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: 'read:user user:email',
  }
  const params = new URLSearchParams(config).toString()
  const finalUrl = `${baseUrl}?${params}`
  res.redirect(finalUrl)
  //- a(href='https://github.com/login/oauth/authorize?client_id=92bcfd75e0bd155308f8&allow_signup=false&scope=read:user user:email') Continue with GitHub &rarr;
}

export const finishGithubLogin = async (req, res) => {
  const baseUrl = 'https://github.com/login/oauth/access_token'
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  }
  const params = new URLSearchParams(config).toString()
  const finalUrl = `${baseUrl}?${params}`
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
  ).json()

  // console.log(json)
  // res.send(JSON.stringify(json))
  if ('access_token' in tokenRequest) {
    const { access_token } = tokenRequest
    const apiUrl = 'https://api.github.com'
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json()
    console.log(userData)
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json()
    console.log(emailData)
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    )
    console.log('email', emailObj)
    if (!emailObj) {
      return res.redirect('/login')
    }
    let user = await User.findOne({ email: emailObj.email })

    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        location: userData.location,
        password: '',
        socialOnly: true,
      })
    }
    req.session.loggedIn = true
    req.session.user = user
    return res.redirect('/')
  } else {
    res.redirect('/login')
  }
  res.end()
}

export const logout = (req, res) => {
  req.session.user = null
  req.session.loggedIn = false
  req.flash('info', 'bye! bye!')
  return res.redirect('/')
}
export const seeUser = async (req, res) => {
  const { id } = req.params
  const user = await User.findById(id).populate({
    path: 'videos',
    populate: {
      path: 'owner',
      model: 'User',
    }, ///videos와 ref된 owner를 불러옴, 따블 populate임.video의 creator를 콜함.
  })
  console.log(user)
  if (!user) {
    return res.status(400).render('404', { pageTitle: 'User not Found' })
  }
  // const videos = await Video.find({ owner: user._id })
  return res.render('profile', {
    pageTitle: `${user.email} Profile`,
    user,
  })
}

export const getUserEdit = (req, res) => {
  res.render('edit-profile', { pageTitle: 'Edit Profile' })
}

export const postUserEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl, email: sessionEmail, username: sessionUsername },
    },
    body: { name, email, username, location },
    file,
  } = req
  console.log(file)

  let searchParam = []
  if (sessionEmail !== email) {
    searchParam.push({ email })
  }
  if (sessionUsername !== username) {
    searchParam.push({ username })
  }
  if (searchParam.length > 0) {
    const foundUser = await User.findOne({ $or: searchParam })
    if (foundUser && String(foundUser._id) !== String(_id)) {
      return res.status(400).render('edit-profile', {
        pageTitle: 'Edit Profile',
        errorMessage: 'This username/email is already taken',
      })
    }
  }
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      username,
      email,
      location,
    },
    { new: true }
  )
  // req.session.user = {
  //   ...req.session.user,
  //   name,
  //   email,
  //   username,
  //   location,
  // }
  req.session.user = updateUser
  return res.redirect('/')
}

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect('/')
  }
  return res.render('change-password', { pageTitle: 'Change Password' })
}
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, newPasswordConfirm },
  } = req
  const ok = await bcrypt.compare(oldPassword, password)
  if (!ok) {
    return res.status(400).render('change-password', {
      pageTitle: 'Change Password',
      errorMessage: 'The OldPassword incorrect.',
    })
  }
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render('change-password', {
      pageTitle: 'Change Password',
      errorMessage: 'The NewPassword does not match.',
    })
  }
  const user = await User.findById(_id)
  user.password = newPassword
  await user.save()
  req.session.user.password = user.password
  return res.redirect('/users/logout')
}
