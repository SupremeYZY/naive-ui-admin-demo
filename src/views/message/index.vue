<template>
  <div>
    <n-grid class="mt-4" cols="1 s:1 m:1 l:3 xl:3 2xl:3" responsive="screen" :x-gap="12">
      <n-gi span="1">
        <n-card :segmented="{ content: true }" :bordered="false" size="small">
          <template #header>
            <n-space>
              <n-popconfirm :negative-text="null" :show-icon="false" @positive-click="addTree">
                <n-input placeholder="请输入分组名称" v-model:value="drawerTitle" />
                <template #trigger>
                  <n-button>新建消息分组</n-button>
                </template>
              </n-popconfirm>
            </n-space>
          </template>
          <div class="w-full menu">
            <n-input type="input" v-model:value="pattern" placeholder="输入菜单名称搜索">
              <template #suffix>
                <n-icon size="18" class="cursor-pointer">
                  <SearchOutlined />
                </n-icon>
              </template>
            </n-input>
            <div class="py-3 menu-list">
              <template v-if="loading">
                <div class="flex items-center justify-center py-4">
                  <n-spin size="medium" />
                </div>
              </template>
              <template v-else>
                <n-tree
                  block-line
                  cascade
                  :selectable="false"
                  :virtual-scroll="true"
                  :pattern="pattern"
                  :data="createData()"
                  :expandedKeys="expandedKeys"
                  style="max-height: 650px; overflow: hidden"
                  @update:selected-keys="selectedTree"
                  @update:expanded-keys="onExpandedKeys"
                />
              </template>
            </div>
          </div>
        </n-card>
      </n-gi>
      <n-gi span="2">
        <n-card :segmented="{ content: true }" :bordered="false" size="small">
          <template #header>
            <n-space>
              <n-icon size="18">
                <FormOutlined />
              </n-icon>
              <span v-if="isEditMenu">编辑菜单{{ treeItemTitle ? `：${treeItemTitle}` : '' }}</span>
              <span else>新建消息{{ treeItemTitle ? `：${treeItemTitle}` : '' }}</span>
            </n-space>
          </template>
          <n-form
            v-if="isEditMenu"
            :model="editFormParams"
            :rules="rules"
            label-placement="left"
            :label-width="100"
            class="py-4"
          >
            <n-form-item label="消息名称" path="name">
              <n-input placeholder="请输入标题" v-model:value="editFormParams.name" />
            </n-form-item>
            <n-form-item label="所属消息分组" path="group">
              <n-select
                placeholder="请选择所属消息分组"
                :options="groupList.value"
                v-model:value="editFormParams.group"
              />
            </n-form-item>
            <n-form-item label="消息工具" path="tool">
              <n-select
                placeholder="请选择消息工具"
                :options="toolList"
                v-model:value="editFormParams.tool"
              />
            </n-form-item>
            <n-form-item label="消息类型" path="type">
              <n-select
                placeholder="请选择消息类型"
                :options="typeList"
                v-model:value="editFormParams.type"
              />
            </n-form-item>
            <n-form-item label="选择模板" path="template">
              <n-select
                placeholder="请选择模板"
                :options="templateList"
                v-model:value="editFormParams.template"
              />
            </n-form-item>
            <n-form-item path="auth" style="margin-left: 100px">
              <n-space>
                <n-button type="primary" :loading="subLoading" @click="formSubmit">新建</n-button>
              </n-space>
            </n-form-item>
          </n-form>
          <n-form
            v-else
            :model="formValues"
            :rules="rules"
            label-placement="left"
            require-mark-placement="left"
            :label-width="100"
            class="py-4"
            @validate="templatePreview()"
          >
            <n-form-item label="消息名称" path="name">
              <n-input placeholder="请输入标题" v-model:value="formValues.name" />
            </n-form-item>
            <n-form-item label="所属消息分组" path="group">
              <n-select
                placeholder="请选择所属消息分组"
                :options="groupList"
                v-model:value="formValues.group"
              />
            </n-form-item>
            <n-form-item label="消息工具" path="tool">
              <n-select
                placeholder="请选择消息工具"
                :options="toolList"
                v-model:value="formValues.tool"
              />
            </n-form-item>
            <n-form-item label="消息类型" path="type">
              <n-select
                placeholder="请选择消息类型"
                :options="typeList"
                v-model:value="formValues.type"
              />
            </n-form-item>
            <n-form-item label="选择模板" path="template">
              <n-select
                placeholder="请选择模板"
                :options="templateList"
                v-model:value="formValues.template"
              />
            </n-form-item>
            <n-form-item path="auth" style="margin-left: 100px">
              <n-space>
                <n-button type="primary" :loading="subLoading" @click="formSubmit">新建</n-button>
              </n-space>
            </n-form-item>
          </n-form>
        </n-card>
      </n-gi>
    </n-grid>
    <n-modal :show="subLoading" transform-origin="center">
      <n-card
        style="width: 600px"
        title="创建成功"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <div @click="closeModel()">
            关闭
          </div>
        </template>
          {{ formValues.group }}
      </n-card>
    </n-modal>
  </div>
</template>
<script lang="ts" setup>
import {ref, unref, reactive, onMounted, computed, h, nextTick} from 'vue';
  import {NButton, TreeOption, useDialog, useMessage } from 'naive-ui';
  import { DownOutlined, AlignLeftOutlined, SearchOutlined, FormOutlined, InsertRowAboveOutlined } from '@vicons/antd';
  import { getMenuList } from '@/api/system/menu';
  import { getTreeItem } from '@/utils';
  import { uuid } from '@/utils/uuid';
  import { repeat } from 'seemly';
  import { getTemplateList } from "@/api/template/list";

  const rules = {
    name: {
      required: true,
      message: '请输入标题',
      trigger: 'blur',
    },
    group: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择消息分组',
    },
    tool: {
      type: 'number',
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择消息工具',
    },
    type: {
      type: 'number',
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择类型',
    },
    template: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择模板',
      validate: () => {
        console.log(1)
      }
    },
  };
  const groupList = ref([]);
  const toolList = [
    {
      label: '钉钉',
      value: 1,
    },
  ];

  const typeList = [
    {
      label: '机器人单聊',
      value: 1,
    },
    {
      label: '机器人群聊',
      value: 2,
    },
  ];

  let templateList = [];

  const formRef: any = ref(null);
  const message = useMessage();
  const dialog = useDialog();

  let treeItemKey = ref([]);

  let expandedKeys = ref([]);

  const treeData = ref([
    {
      id: '1',
      title: '未分组',
    },
  ]);

  const messageData = ref([]);


  const loading = ref(true);
  const subLoading = ref(false);
  const isEditMenu = ref(false);
  const treeItemTitle = ref('');
  const pattern = ref('');
  const drawerTitle = ref('');

  const formParams = () => ({
    name: '',
    group: null,
    tool: null,
    type: null,
    template: null,
  });
  const formValues = reactive(formParams());

  const editFormParams = reactive({
    name: '',
    group: null,
    tool: null,
    type: null,
    template: null,
  });

  function addCategory(key: string) {
    console.log('Click the add button');
    treeData.value.push({
      id: 2,
      title: '邮件',
    })
  }

  function selectedTree(keys) {
    // if (keys.length) {
    //   const treeItem = getTreeItem(unref(treeData), keys[0]);
    //   treeItemKey.value = keys;
    //   treeItemTitle.value = treeItem.label;
    //   Object.assign(formParams, treeItem);
    //   isEditMenu.value = true;
    // } else {
    //   isEditMenu.value = false;
    //   treeItemKey.value = [];
    //   treeItemTitle.value = '';
    // }
    console.log('click tree')
  }

  function handleDel() {
    dialog.info({
      title: '提示',
      content: `您确定想删除此权限吗?`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        message.success('删除成功');
      },
      onNegativeClick: () => {
        message.error('已取消');
      },
    });
  }

  function handleReset() {
    const treeItem = getTreeItem(unref(treeData), treeItemKey.value[0]);
    Object.assign(formParams, treeItem);
  }

  function formSubmit() {
    console.log(formValues)
    messageData.value.push(formValues);
    subLoading.value = true;
    console.log(messageData.value);
  }

  onMounted(async () => {
    // const treeMenuList = await getMenuList();
    // const keys = treeMenuList.list.map((item) => item.key);
    // Object.assign(formParams, keys);
    // treeData.value = treeMenuList.list;
    const templateData = await getTemplateList();
    templateData.list.map((item) => {
        const options = {
          label: item.name,
          value: item.id,
        };
        templateList.push(options)
      }
    );
    console.log(templateList)
    loading.value = false;
  });

  function onExpandedKeys(keys) {
    expandedKeys.value = keys;
  }

  function closeModel() {
    subLoading.value = false;
  }

  function addTree() {
    console.log(uuid());
    const params = {
      id: uuid(),
      title: drawerTitle.value,
    };
    const gData = {
      label: params.title,
      value: params.id,
    };
    groupList.value.push(gData);

    treeData.value.push(params);
  }

  function click(step) {
    console.log(step);
  }

  function templdatePreview() {
    console.log(1)
  }

  function createData(level = 2, baseKey = '', count = treeData.value.length): TreeOption[] | undefined {
    if (!level) return undefined
    let treeStep = treeData.value.length;
    let messageStep = messageData.value.length;

    if (count < 1) count = 1;
    return repeat(count, undefined).map((_, index) => {
      const key = '' + baseKey + level + index
      let label = null;

      // 最底端 tree 节点
      if (level == 1) {

        if (messageData.value.length > 0) {
          const buttonList = [
            h('div', { style: 'display: flex; flex-direction: column;width: 100%'}, { default: () => [
                h('span', { style: 'width: 100px'}, { default: () => messageData.value[count - messageStep].group }),
                h('span', null, { default: () =>  messageData.value[count - messageStep].name }),
              ]}),
            h(NButton, { type: "default"}, { default: () => `add`}),
            h(NButton, { type: "default"}, { default: () => `update`}),
          ]
          messageStep--;
          label = () => h('div', { style: 'display: flex;border: solid 1px #EEEEF2;padding: 20px'}, { default: () => buttonList });
        } else {
          label = () => h('div', { style: 'display: flex;border: solid 1px #EEEEF2;padding: 20px'}, { default: () => `空` });
        }

      } else {
        const buttonList = [
          h('span', null, { default: () => treeData.value[count - treeStep].title}),
          h(NButton, { type: "default", onClick: click}, { default: () => `add`}),
          h(NButton, { type: "default", onClick: click}, { default: () => `update`}),
          h(NButton, { type: "default", onClick: click}, { default: () => `del`})
        ];
        label = () => h('div', null, { default: () => buttonList });
        treeStep--;
      }
      return {
        label,
        key,
        children: createData(level - 1, key, messageData.value.length),
      }
    })
  }

</script>
