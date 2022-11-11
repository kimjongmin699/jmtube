const videoContainer = document.getElementById('videoContainer')
const form = document.getElementById('commentForm')
const btn = form.querySelector('button')
const textarea = form.querySelector('textarea')

const addComment = (text, id) => {
  const videoComments = document.querySelector('.video__comments')
  const newComment = document.createElement('li')
  newComment.dataset.id = id;
  newComment.className = 'video__comment'
  const icon = document.createElement('i')
  icon.className = 'fas fa-comment'
  const span = document.createElement('span')
  span.innerText = ` ${text}`
  const span2 = document.createElement('span')
  span2.innerText = '✖'
  newComment.appendChild(icon)
  newComment.appendChild(span)
  newComment.appendChild(span2)
  //videoComments.appendChild(newComment) //댓글이 맨 밑에 생김.
  videoComments.prepend(newComment) //댓글이 맨위에 생김
}

const handleSubmit = async (event) => {
  event.preventDefault()
  const text = textarea.value
  const videoId = videoContainer.dataset.id
  console.log('videoId', videoId)

  if (text === '') {
    return
  }

  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ text }),
    //JS로 server에 data를 보내기 위해서는 이렇게 해야함.
    //req.body.text로 접근가능해짐.(서버에서)
    //middleware에서 express.json()도 해주어야함.
  })
  if (response.status === 201) {
    const { newCommentId } = await response.json()
    addComment(text, newCommentId)
    textarea.value = ''
  }
  //window.location.reload()
}

form.addEventListener('submit', handleSubmit)
