import 'dotenv/config'
import './db'
import Video from './models/Video'
import User from './models/User'
import Comment from './models/Comment'
import flash from 'express-flash'
import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import morgan from 'morgan'
import rootRouter from './routes/rootRouter'
import userRouter from './routes/userRouter'
import videoRouter from './routes/videoRouter'
import { localsMiddleware } from './middlewares'
import apiRouter from './routes/apiRouter'

const PORT = 4000
const app = express()
const logger = morgan('dev')

app.set('view engine', 'pug')
app.set('views', process.cwd() + '/src/views')
app.use(logger)
app.use(express.urlencoded({ extended: true }))
///pug파일의 form에서 보내는 data를 server가 받게 해줌.(req.body.. 등)
app.use(express.json())

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false, //true하면 req요청때마다, cookie만듬, false는 login떄만 만듬
    saveUninitialized: false,
    cookie: {
      maxAge: 200000000000,
    },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
)

// app.use((req, res, next) => {
//   res.locals.sexy = 'you' //pug파일에서 sexy로 접근가능
//   res.locals.siteName = 'jmTube' //pug파일에서 siteName으로 접근가능
//   console.log(res)
//   res.sessionStore.all((error, sessions) => {
//     console.log(sessions)
//     next()
//   })
// })

app.use(flash())
app.use(localsMiddleware)
app.use('/uploads', express.static('uploads')) //'/uploads' path로 uploads폴더에 접근허락해조
app.use('/static', express.static('assets')) //'/assets' path로 assets폴더에 접근허락해조
app.use('/', rootRouter)
app.use('/videos', videoRouter)
app.use('/users', userRouter)
app.use('/api', apiRouter)

app.listen(PORT, () => console.log('Server start in 4000'))
