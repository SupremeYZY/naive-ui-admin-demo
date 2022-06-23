import { h } from 'vue';
import {NAvatar} from "naive-ui";
export const columns = [
  {
    title: '模板ID',
    key: 'id',
    width: 100,
  },
  {
    title: '模板名称',
    key: 'name',
    width: 100,
  },
  {
    title: '消息标题',
    key: 'title',
    width: 100,
  },
  {
    title: '消息正文',
    key: 'content',
    width: 150,
  },
  {
    title: '标题变量',
    key: 'ETitle',
    width: 160,
  },
  {
    title: '正文变量',
    key: 'EContent',
    width: 160,
  },
  {
    title: '效果图示',
    key: 'img',
    width: 100,
    render(row) {
      return h(NAvatar, {
        size: 48,
        src: row.img,
      });
    },
  },
];
