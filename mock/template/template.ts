import { Random } from 'mockjs';
import { resultSuccess } from '../_util';

const list = () => {
  const result: any[] = [
    {
      id: '1',
      name: 'GM后台邮件',
      title: 'GM后台邮件{{msgReasonMail}}',
      content: '**邮件 - {{msgReasonMail}}** \n\n> 游戏：{{msgGameName}} \n\n> ID: {{msgMailId}} | ' +
        '标题：{{msgTitleMail}} \n\n> 发起人：{{msgSenderMail}} \n\n [点击这里查看]({{msgUrlMail}})',
      ETitle: '{{msgGameName}}',
      EContent: '{{msgReasonMail}}{{msgMailId}}{{msgTitleMail}}{{msgSenderMail}}{{msgUrlMail}}',
      img: Random.image('400x400', Random.color(), Random.color(), Random.first()),
      'no|100000-10000000': 100000,
      'status|1': [true, false],
    },
  ];
  return result;
};

export default [
  //表格数据列表
  {
    url: '/api/template/list',
    timeout: 1000,
    method: 'get',
    response: () => {
      return resultSuccess({
        list,
      });
    },
  },
];
