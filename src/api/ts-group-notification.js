import request from '@/utils/request'

// 创建今日通知组推送
export function createTodayGroupNotification() {
  return request({
    url: '/api/v1/ts_group_notifications/today',
    method: 'post'
  })
}

// 获取通知组推送列表
export function getGroupNotificationList() {
  return request({
    url: '/api/v1/ts_group_notifications',
    method: 'get'
  })
}

// 按日期获取通知组推送
export function getGroupNotificationByDate(date) {
  return request({
    url: `/api/v1/ts_group_notifications/${date}`,
    method: 'get'
  })
}

// 按城市聚合获取通知组推送
export function getGroupNotificationByCity(date) {
  return request({
    url: `/api/v1/ts_group_notifications/${date}/aggr_by_city`,
    method: 'get'
  })
}

// 获取通知组推送的详细列表
export function getGroupNotificationDetail(date) {
  return request({
    url: `/api/v1/ts_group_notifications/${date}/group_list`,
    method: 'get'
  })
} 