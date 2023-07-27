import request from '@/utils/request'

export function listArticles() {
  return request({
    url: `/api/v1/article/list`,
    method: 'get'
  })
}

export function submitTodayArticle(postId) {
  return request({
    url: `/api/v1/article/submitToday`,
    method: 'post'
  })
}

export function updateArticleStatus(date, status) {
  return request({
    url: `/api/v1/article/setStatus`,
    method: 'put',
    params: {
      date: date,
      status: status
    }
  })
}

export function deleteTodayArticle(postId) {
  return request({
    url: `/api/v1/article/removeToday`,
    method: 'delete'
  })
}
