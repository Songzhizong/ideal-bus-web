import request from '@/utils/request'

export function query(query) {
  return request({
    url: '/server/application/query',
    method: 'get',
    params: query
  })
}

export function create(data) {
  return request({
    url: '/server/application/create',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/server/application/update',
    method: 'post',
    data
  })
}

export function del(subscriberId) {
  return request({
    url: '/server/application/delete/' + subscriberId,
    method: 'delete'
  })
}
