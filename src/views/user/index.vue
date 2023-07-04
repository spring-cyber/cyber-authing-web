<template>
  <div>
    <c-page-label title="用户管理" icon="cyber-zhanghuxinxi" document-link="#用户管理">
      <template #tips>管理用户相关信息。</template>
    </c-page-label>

    <c-radio-wrapper v-model:value="queryState.status" @change="methods.searchQuery">
      <c-radio-button value="" :count="tableState.total">全部</c-radio-button>
      <c-radio-button
        v-for="(item, index) in USER_STATUS"
        :key="index"
        :value="item.value"
        :count="tableState.count[item.value] || '0'"
        :dark="item.value == '1'"
      >{{ item.label }}</c-radio-button>
    </c-radio-wrapper>

    <c-table-wrapper
      rowKey="id"
      ref="tableRef"
      v-model:loading="tableState.loading"
      :columns="tableState.columns"
      :overlayMenu="tableState.overlayMenu"
      @search="methods.searchQuery"
    >
      <template #collapse>
        <!-- 所属企业 -->
        <c-enterprise-select
          v-model:value="queryState.enterpriseId"
          width="168"
          allowClear
          placeholder="所属企业"
          @change="() => {
            queryState.deptIds = undefined;
            methods.searchQuery();
          }"
        ></c-enterprise-select>
        <!-- 所属部门 -->
        <c-dept-tree-select
          v-model:value="queryState.deptIds"
          class="w-168px"
          allowClear
          placeholder="所属部门"
          :enterpriseId="queryState.enterpriseId"
          @change="methods.searchQuery"
        ></c-dept-tree-select>
        <!-- 用户名称搜索 -->
        <a-input
          v-model:value="queryState.name"
          placeholder="请输入姓名、手机号搜索..."
          style="width: 256px"
          @keydown.enter="methods.searchQuery()"
        >
          <template #suffix><c-icon icon="cyber-sousuo" size="16" color="#BDBDBD" /></template>
        </a-input>
      </template>
      <template #right>
        <a-button type="primary" @click="methods.showModify()">新建</a-button>
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

    <Modify ref="modifyRef" @ok="methods.searchQuery()"></Modify>
    <ModifyPassword ref="passwordRef" @ok="methods.searchQuery()"></ModifyPassword>
  </div>
</template>

<script setup>
import axios from '@/api';
import { changeHistoryState, initHistoryState, useDict, Modal } from 'cyber-web-ui';
import Modify from './modules/Modify.vue';
import ModifyPassword from './modules/ModifyPassword.vue';
const { USER_STATUS } = useDict({ COMMON: ['USER_STATUS'] });
const tableRef = ref(); // 表格ref
const modifyRef = ref(); // 弹窗ref
const passwordRef = ref();
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    enterpriseId: undefined,
    deptIds: undefined,
    name: undefined,
    status: '',
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '用户名称', key: "name", width: '14%', ellipsis: true },
    { title: '所属企业', dataIndex: "enterpriseName", width: '14%', ellipsis: true },
    { title: '所属部门', key: "userDeptInfo", ellipsis: true },
    { title: '岗位', key: "positionInfo", ellipsis: true },
    { title: '手机号码', dataIndex: "phone", width: '14%' },
    { title: '用户状态', key: "status", width: '12%'  },
    { title: '更新时间', dataIndex: "updateTime", width: '200px' },
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
      handler: (record) => methods.showModifyPassword(record),
    },
  ],
  count: {},
  total: '0',
});

const methods = {
  // 搜索表格
  async searchQuery() {
    if(!queryState.enterpriseId) {
      queryState.deptIds = undefined;
    }
    changeHistoryState(queryState);
    try {
      let res = await axios.request({
        url: '/auth/user/status/count',
        method: 'get',
      });
      tableState.total = 0;
      (res.data || []).forEach(item => {
        tableState.count[item.status] = item.count + ''
        tableState.total += item.count;
      });
      tableState.total += '';
    } catch {
      tableState.total = 0;
      tableState.count = {};
    };
    unref(tableRef).searchQuery({
      url: '/auth/user/search',
      method: 'get',
      params: {
        ...queryState,
        phone: queryState.name,
        deptIds: queryState.deptIds || undefined,
        enterpriseId: queryState.deptIds ? undefined : queryState.enterpriseId,
      },
    });
  },
  // 显示弹窗
  showModify(record) {
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
    });
  },
  // 显示修改密码弹窗
  showModifyPassword(record) {
    unref(passwordRef).showModal(record);
  },
};

onMounted(() => {
  methods.searchQuery();
});
</script>

<style lang="less" scoped>
</style>
