import request from '@/utils/request'

export function createTodayNotification() {
  return request({
    url: `/api/v1/ts_notifications/today`,
    method: 'post'
  })
}

export function getNotificationList() {
  return request({
    url: `/api/v1/ts_notifications`,
    method: 'get'
  })
}

export function getNotificationByCity(date) {
  return request({
    url: `/api/v1/ts_notifications/${date}/aggr_by_city`,
    method: 'get'
  })
}

export function getNotificationByLine(date) {
  return request({
    url: `/api/v1/ts_notifications/${date}/post_list`,
    method: 'get'
  })
}
