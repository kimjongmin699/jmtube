import mongoose from 'mongoose'

// export const formatHashtags = (hashtags) =>
//   hashtags.split(',').map((word) => (word.startsWith('#') ? word : `#${word}`))

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    upppercase: true,
    trim: true,
    maxLength: 140,
  },
  fileUrl: { type: String, required: true },
  description: String,
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
})

videoSchema.static('formatHashtags', function (hashtags) {
  return hashtags
    .split(',')
    .map((word) => (word.startsWith('#') ? word : `#${word}`))
})

// videoSchema.pre('save', async function () {
//   console.log('we saving this.', this)
//   this.hashtags = this.hashtags[0]
//     .split(',')
//     .map((word) => (word.startsWith('#') ? word : `#${word}`))
// })

const Video = mongoose.model('Video', videoSchema)
export default Video
