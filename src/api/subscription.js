import request from '@/utils/request'

export function getAllByApplication(applicationId) {
  return request({
    url: '/server/subscription/application?applicationId=' + applicationId,
    method: 'get'
  })
}

export function subscribe(data) {
  return request({
    url: '/server/subscription/subscribe',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/server/subscription/update?subscriptionId=' + data.subscriptionId,
    method: 'post',
    data
  })
}

export function reversalStatus(subscriptionId) {
  return request({
    url: '/server/subscription/status/reversal?subscriptionId=' + subscriptionId,
    method: 'post'
  })
}


export function unsubscribe(applicationId, topic) {
  return request({
    url: '/server/subscription/unsubscribe?applicationId=' +
      applicationId + '&topic=' + topic,
    method: 'post'
  })
}
