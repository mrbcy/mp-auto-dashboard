import request from '@/utils/request'

export function searchPostGroups(query) {
  return request({
    url: '/api/v1/ts_post_groups/search',
    method: 'get',
    params: query
  })
}

export function getPostGroupDetail(groupId) {
  return request({
    url: `/api/v1/ts_post_groups/${groupId}/posts`,
    method: 'get'
  })
}

export function updatePostGroupsStatus(groupIds, targetStatus) {
  return request({
    url: '/api/v1/ts_post_groups/status',
    method: 'patch',
    data: {
      groupIds,
      targetStatus
    }
  })
}

export function addPostGroupsToList(listType, groupIds) {
  return request({
    url: `/api/v1/ts_group_list/${listType}/groups`,
    method: 'patch',
    data: {
      groupIds
    }
  })
}

export function removePostGroupsFromList(listType, groupIds) {
  return request({
    url: `/api/v1/ts_post_groups/${listType}`,
    method: 'delete',
    data: {
      groupIds
    }
  })
}

export function getWaitingReviewList() {
  return request({
    url: '/api/v1/ts_group_list/1',
    method: 'get'
  })
}

export function getToShareList() {
  return request({
    url: '/api/v1/ts_group_list/2',
    method: 'get'
  })
}

export function clearList(listType) {
  return request({
    url: `/api/v1/ts_group_list/${listType}/clear`,
    method: 'patch'
  })
}

export function approvePostGroup(groupId, desc) {
  return request({
    url: `/api/v1/ts_post_groups/${groupId}/approve`,
    method: 'patch',
    data: {
      desc
    }
  })
}

export function discardPostGroup(groupId, desc) {
  return request({
    url: `/api/v1/ts_post_groups/${groupId}/discard`,
    method: 'patch',
    data: {
      desc
    }
  })
}

export function setManualPostId(groupId, postId) {
  return request({
    url: `/api/v1/ts_post_groups/${groupId}/manualPostId`,
    method: 'patch',
    data: {
      postId
    }
  })
} 