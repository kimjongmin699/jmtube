import mongoose from 'mongoose'

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
})

const db = mongoose.connection

const handleOpen = () => console.log('Connected to DB') //콜백으로 넣어도 되고, 만들어서 넣어도 되고

db.on('error', (error) => console.log('DB error', error)) //on은 여러번, once 한번
db.once('open', handleOpen)
