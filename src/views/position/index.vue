<template>
  <div>
    <c-page-label title="岗位管理" icon="cyber-yingyong" document-link="#岗位管理">
      <template #tips>维护岗位相关信息。</template>
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
        <!-- 岗位名称 -->
        <a-input
          v-model:value="queryState.name"
          placeholder="请输入名称搜索..."
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
          <c-cell icon="cyber-gangwei1" :title="record.name"></c-cell>
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
    { title: '岗位名称', key: "name", width: '15%', ellipsis: true },
    { title: '岗位编码', dataIndex: "code", width: '15%', ellipsis: true },
    { title: '所属企业', dataIndex: "enterpriseName", width: '15%', ellipsis: true },
    { title: '岗位描述', dataIndex: "description", ellipsis: true, customRender: ({ text }) => text || '-' },
    { title: '岗位状态', key: "status", width: '15%'  },
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
        url: '/auth/position/status/count',
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
      url: '/auth/position/search',
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
      content: `是否确认删除“${record.name}”的岗位及其相关数据？如有用户关联关系，不可删除。`,
      value: record.name,
      params: {
        url: '/auth/position',
        method: 'delete',
        params: {
          id: record.id,
        }
      },
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
