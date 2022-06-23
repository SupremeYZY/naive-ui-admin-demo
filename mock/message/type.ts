import { resultSuccess } from '../_util';

const menuList = () => {
  const result: any[] = [
    {
      id: '1',
      title: '未分组',
    },
  ];
  return result;
};

export default [
  {
    url: '/api/message/type',
    timeout: 1000,
    method: 'get',
    response: () => {
      const list = menuList();
      return resultSuccess({
        list,
      });
    },
  },
];
