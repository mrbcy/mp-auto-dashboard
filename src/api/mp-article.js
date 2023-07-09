import request from '@/utils/request-mp'

export function createDraft(posts) {
  const data = {
    'posts': posts
  }

  return request({
    url: '/api/v1/create-draft',
    method: 'post',
    data
  })
}

export function reservePost(postId) {
  return request({
    url: `/api/v1/post/${postId}/reserve`,
    method: 'post'
  })
}

export function releasePost(postId) {
  return request({
    url: `/api/v1/post/${postId}/release`,
    method: 'post'
  })
}

export function listTodayPosts() {
  return request({
    url: `/api/v1/post/today`,
    method: 'get'
  })
}
