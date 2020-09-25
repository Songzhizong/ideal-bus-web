import request from '@/utils/request'

export function refreshCacheNotice() {
  return request({
    url: '/server/cache/refresh/notice',
    method: 'get'
  })
}
