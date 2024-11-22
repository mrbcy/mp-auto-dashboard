import request from '@/utils/request'

export function getTsList(listType) {
  return request({
    url: `/api/v1/ts_list/${listType}`,
    method: 'get'
  })
}

export function addPostsToList(listType, postIds) {
  const data = {
    postIds: postIds
  }

  return request({
    url: `/api/v1/ts_list/${listType}/posts`,
    method: 'patch',
    data: data
  })
}

export function removePostsFromList(listType, postIds) {
  const data = {
    postIds: postIds
  }

  return request({
    url: `/api/v1/ts_list/${listType}/posts`,
    method: 'delete',
    data: data
  })
}

export function removeList(listType) {
  return request({
    url: `/api/v1/ts_list/${listType}`,
    method: 'delete'
  })
}
