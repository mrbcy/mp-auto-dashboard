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
