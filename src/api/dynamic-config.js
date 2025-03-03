import request from '@/utils/request'

export function searchConfigs(query) {
  return request({
    url: '/api/v1/dynamic_config/search',
    method: 'get',
    params: query
  })
}

export function updateConfig(serviceId, data) {
  return request({
    url: `/api/v1/dynamic_config/${serviceId}`,
    method: 'put',
    data
  })
}

export function createConfig(data) {
  return request({
    url: '/api/v1/dynamic_config',
    method: 'post',
    data
  })
}

export function deleteConfig(serviceId) {
  return request({
    url: `/api/v1/dynamic_config/${serviceId}`,
    method: 'delete'
  })
}
