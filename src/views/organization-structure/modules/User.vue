<template>
  <div>
    <c-table-wrapper
      rowKey="id"
      ref="tableRef"
      v-model:loading="tableState.loading"
      :columns="tableState.columns"
      :overlayMenu="tableState.overlayMenu"
      @search="methods.searchQuery"
    >
      <template #collapse>
        <c-position-select
          v-model:value="queryState.positionId"
          :enterpriseId="enterprise"
          width="168px"
          allowClear
          placeholder="岗位"
          @change="methods.searchQuery"
        ></c-position-select>
        <a-checkbox v-model:checked="queryState.directly" @change="methods.searchQuery()">仅展示部门直属成员</a-checkbox>
      </template>
      <template #right>
        <a-button type="primary" ghost :disabled="disabled" @click="methods.showModify()">添加成员</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'name'">
          <c-cell icon="cyber-zhanghuxinxi1" :title="record.name"></c-cell>
        </template>
        <template v-if="column.key == 'status'">
          <c-cell-dict :options="USER_STATUS" :value="record.status"></c-cell-dict>
        </template>
        <template v-if="column.key == 'userDeptInfo'">
          <a-tag color="green" v-for="(item, index) in record.userDeptInfo" :key="index">
            {{ item.name }}
          </a-tag>
        </template>
        <template v-if="column.key == 'positionInfo'">
          <a-tag color="green" v-for="(item, index) in record.positionInfo" :key="index">
            {{ item.name }}
          </a-tag>
        </template>
      </template>
    </c-table-wrapper>

    <Modify
      ref="modifyRef"
      @ok="() => {
        $emit('change');
        methods.searchQuery();
      }"
    ></Modify>
  </div>
</template>

<script setup>
import Modify from '@/views/user/modules/Modify.vue';
import { changeHistoryState, initHistoryState, useDict, Modal } from 'cyber-web-ui';
const props = defineProps({
  enterprise: String,
  dept: String,
  user: String,
  subDepts: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  }
});
const { USER_STATUS } = useDict({ COMMON: ['USER_STATUS'] });
const tableRef = ref(); // 表格ref
const modifyRef = ref(); // 弹窗ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    positionId: undefined,
    directly: {
      type: 'boolean',
      defaultValue: false,
    }
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '用户名称', key: "name", ellipsis: true },
    { title: '所属企业', dataIndex: "enterpriseName", width: '15%', ellipsis: true },
    { title: '所属部门', key: "userDeptInfo", width: '15%', ellipsis: true },
    { title: '岗位', key: "positionInfo", width: '15%', ellipsis: true },
    { title: '手机号码', dataIndex: "phone", width: '15%' },
    { title: '用户状态', key: "status", width: '15%'  },
  ],
  overlayMenu: [
    {
      label: "编辑",
      handler: (record) => methods.showModify(record),
    },
    {
      label: "删除",
      handler: (record) => methods.delete(record),
    },
    {
      label: "修改密码",
      // handler: (record) => methods.delete(record),
    },
  ],
});

const $emit = defineEmits(['change']);

const methods = {
  // 搜索表格
  searchQuery() {
    changeHistoryState(queryState);
    let params = { ...queryState, directly: undefined };
    if(queryState.directly) {
      if(props.dept) params.deptIds = props.dept;
      else {
        params.enterpriseId = props.enterprise;
        params.deptIds = [...props.subDepts].join(',');
      }
    } else {
      if(props.dept) params.deptIds = [props.dept, ...props.subDepts].join(',');
      else params.enterpriseId = props.enterprise;
    }
    unref(tableRef).searchQuery({
      url: '/auth/user/search',
      method: 'get',
      params: params,
    });
  },
  // 显示弹窗
  showModify(record) {
    if(!record) {
      record = {
        deptIds: [props.enterprise, props.dept].filter(item => item),
        enterpriseId: props.enterprise,
      };
    }
    unref(modifyRef).showModal(record);
  },
  // 删除
  delete(record) {
    Modal.verify({
      content: `是否确认删除“${record.name}”的用户及其相关数据？`,
      value: record.name,
      params: {
        url: '/auth/user',
        method: 'delete',
        params: {
          id: record.id,
        }
      },
    }).then(() => {
      methods.searchQuery();
      $emit('change');
    });
  },
};

watch(() => [props.enterprise, props.dept], () => {
  queryState.positionId = undefined;
});

defineExpose({
  searchQuery: methods.searchQuery,
});
</script>

<style lang="less" scoped>
</style>
