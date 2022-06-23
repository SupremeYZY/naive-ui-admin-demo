import { http } from '@/utils/http/axios';

//获取 type
export function getTypeList(params) {
  return http.request({
    url: '/message/type',
    method: 'get',
    params,
  });
}
