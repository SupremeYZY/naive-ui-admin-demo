import { http } from '@/utils/http/axios';

//获取table
export function getTemplateList(params) {
  return http.request({
    url: '/template/list',
    method: 'get',
    params,
  });
}
