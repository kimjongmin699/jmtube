import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// export const formatHashtags = (hashtags) =>
//   hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`))

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  location: String,
  videos: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Video' },
  ],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
})

userSchema.pre('save', async function () {
  // console.log('111', this.password)
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 5)
  }
  // console.log('222', this.password)
})

const User = mongoose.model('User', userSchema)
export default User
