import request from '@/utils/request'

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

export function createPost(post) {
  const data = post

  return request({
    url: '/api/v1/post',
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

export function updatePost(post) {
  const postId = post.id
  const data = {
    id: post.id,
    title: post.title,
    sourceUrl: post.url,
    content: post.content
  }
  return request({
    url: `/api/v1/post/${postId}`,
    method: 'put',
    data: data
  })
}

export function reorderPosts(postIds) {
  const data = {
    postIds: postIds
  }
  return request({
    url: `/api/v1/post/reorder`,
    method: 'put',
    data: data
  })
}
