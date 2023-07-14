import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    params: {
      // username: data.username,
      // password: data.password
    },
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/v1/user/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
