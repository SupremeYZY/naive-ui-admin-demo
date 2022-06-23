import { http } from '@/utils/http/axios';

//获取table
export function getMessageList(params) {
  return http.request({
    url: '/Message/message',
    method: 'get',
    params,
  });
}
