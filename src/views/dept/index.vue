<template>
  <div>
    <c-page-label title="部门" icon="cyber-bumen1" document-link="#部门管理">
      <template #tips>维护部门相关信息。</template>
    </c-page-label>

    <c-radio-wrapper v-model:value="queryState.status" @change="methods.searchQuery">
      <c-radio-button value="" :count="tableState.total">全部</c-radio-button>
      <c-radio-button
        v-for="(item, index) in STATUS"
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
          @change="methods.searchQuery"
        ></c-enterprise-select>
        <!-- 部门名称搜索 -->
        <a-input
          v-model:value="queryState.name"
          placeholder="请输入部门名称搜索..."
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
          <c-cell icon="cyber-bumen" :title="record.name"></c-cell>
        </template>
        <template v-if="column.key == 'status'">
          <c-cell-dict :options="STATUS" :value="record.status"></c-cell-dict>
        </template>
      </template>
    </c-table-wrapper>

    <Modify ref="modifyRef" @ok="methods.searchQuery()"></Modify>
  </div>
</template>

<script setup>
import axios from '@/api';
import Modify from './modules/Modify.vue';
import { changeHistoryState, initHistoryState, useDict, Modal } from 'cyber-web-ui';
const { STATUS } = useDict({ COMMON: ['STATUS'] });
const tableRef = ref(); // 表格ref
const modifyRef = ref(); // 弹窗ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    status: '',
    name: undefined,
    enterpriseId: undefined,
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '部门名称', key: "name", width: '15%', ellipsis: true },
    { title: '所属企业', dataIndex: "enterpriseName", width: '15%', ellipsis: true },
    { title: '上级部门', dataIndex: "parentDeptName", width: '15%', ellipsis: true, customRender: ({ text }) => text || '-' },
    { title: '部门描述', dataIndex: "description", ellipsis: true, customRender: ({ text }) => text || '-' },
    { title: '部门状态', key: "status", width: '15%'  },
    { title: '更新时间', dataIndex: "updateTime", width: '240px' },
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
  ],
  count: {},
  total: '0',
});

const methods = {
  // 搜索表格
  async searchQuery() {
    changeHistoryState(queryState);
    try {
      let res = await axios.request({
        url: '/auth/dept/status/count',
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
      url: '/auth/dept/search',
      method: 'get',
      params: {
        ...queryState,
        sortBy: 'order_num',
        sortType: 'asc',
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
      value: record.name,
      content: `是否确认删除“${record.name}”的部门及其相关数据？`,
      params: {
        url: '/auth/dept',
        method: 'delete',
        params: {
          id: record.id,
        }
      }
    }).then(() => {
      methods.searchQuery();
    });
  },
};

onMounted(() => {
  methods.searchQuery();
});
</script>

<style lang="less" scoped>
</style>
