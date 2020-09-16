import request from '@/utils/request'

export function query(query) {
  return request({
    url: '/server/subscriber/query',
    method: 'get',
    params: query
  })
}

export function create(data) {
  return request({
    url: '/server/subscriber/create',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/server/subscriber/update',
    method: 'post',
    data
  })
}

export function del(subscriberId) {
  return request({
    url: '/server/subscriber/delete/' + subscriberId,
    method: 'delete'
  })
}
