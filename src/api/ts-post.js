import request from '@/utils/request'

export function searchPosts(query) {
  return request({
    url: `/api/v1/ts_posts/search`,
    method: 'get',
    params: query
  })
}

export function updatePostStatus(postId, status) {
  const data = {
    postIds: [postId],
    targetStatus: status
  }
  return request({
    url: `/api/v1/ts_posts/status`,
    method: 'patch',
    data: data
  })
}
