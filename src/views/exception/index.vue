<template>
  <div>
    <c-page-label title="异常处理" icon="cyber-yichangchuli" document-link="#异常处理">
      <template #tips>维护异常处理相关信息。</template>
    </c-page-label>

    <c-table-wrapper
      rowKey="id"
      ref="tableRef"
      v-model:loading="tableState.loading"
      :columns="tableState.columns"
      :overlayMenu="tableState.overlayMenu"
      @search="methods.searchQuery"
    >
      <template #collapse>
        <a-input
          v-model:value="queryState.userName"
          placeholder="请输入用户账号..."
          style="width: 200px"
          @keydown.enter="methods.searchQuery()"
        >
          <template #suffix><c-icon icon="cyber-sousuo" size="16" color="#BDBDBD" /></template>
        </a-input>
        <a-input
          v-model:value="queryState.ipaddr"
          placeholder="请输入登录 IP..."
          style="width: 200px"
          @keydown.enter="methods.searchQuery()"
        >
          <template #suffix><c-icon icon="cyber-sousuo" size="16" color="#BDBDBD" /></template>
        </a-input>
        <a-range-picker
          v-model:value="queryState.time"
          show-time
          :allowClear="false"
          format="YYYY-MM-DD HH:mm:ss"
          valueFormat="YYYY-MM-DD HH:mm:ss"
          @change="methods.searchQuery"
        />
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == 'createTime'">
          <c-cell icon="cyber-shijian" :title="record.createTime" />
        </template>
        <template v-if="column.key == 'status'">
          <c-cell-dict :options="FORBIDDEN_STATUS" :value="record.status" />
        </template>
      </template>
    </c-table-wrapper>

    <DisableUser ref="disabledUserRef" @ok="methods.searchQuery"></DisableUser>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import DisableUser from './modules/DisableUser.vue';
import { changeHistoryState, initHistoryState, useDict, Modal } from 'cyber-web-ui';
const { FORBIDDEN_STATUS } = useDict({ AUTHING: ['FORBIDDEN_STATUS'] });
const tableRef = ref(); // 表格ref
const disabledUserRef = ref();
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    userName: undefined,
    ipaddr: undefined,
    time: [dayjs().format('YYYY-MM-DD') + ' 00:00:00', dayjs().format('YYYY-MM-DD') + ' 23:59:59'],
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '时间', key: "createTime", width: '16%' },
    { title: '用户账号', dataIndex: "userName", width: '16%', ellipsis: true },
    // { title: '异常问题', dataIndex: "issue", width: '16%', ellipsis: true },
    { title: '登录 IP', dataIndex: "ipaddr", width: '16%' },
    { title: '状态', key: "status", width: '12%' },
    { title: '异常描述', dataIndex: "description", ellipsis: true },
    // { title: '安全风险', dataIndex: "risk", width: '16%', ellipsis: true },
  ],
  overlayMenu: [
    {
      label: "忽略",
      handler: (record) => methods.delete(record),
      show: (record) => record.status == '0',
    },
    {
      label: "封禁",
      handler: (record) => methods.disableUser(record),
      show: (record) => record.status == '0',
    },
    {
      label: "解禁",
      handler: (record) => methods.unDisable(record),
      show: (record) => record.status == '1',
    },
  ],
});

const methods = {
  // 搜索表格
  searchQuery() {
    changeHistoryState(queryState);
    unref(tableRef).searchQuery({
      url: '/auth/exception/search',
      method: 'get',
      params: {
        ...queryState,
        time: undefined,
        startDate: queryState.time[0],
        endDate: queryState.time[1],
        sortBy: 'create_time',
        sortType: 'desc',
      },
    });
  },
  // 忽略
  delete(record) {
    Modal.verify({
      content: `是否确认忽略“${record.userName}”用户的异常日志？`,
      value: record.userName,
      params: {
        url: '/auth/exception',
        method: 'delete',
        params: {
          expId: record.expId,
        }
      }
    }).then(() => {
      methods.searchQuery();
    });
  },
  // 封禁
  disableUser(record) {
    unref(disabledUserRef).showModal(record);
  },
  // 解禁
  unDisable(record) {
    Modal.verify({
      content: `是否确认解禁“${record.userName}”用户？`,
      value: record.userName,
      params: {
        url: '/auth/exception/unDisable',
        method: 'get',
        params: {
          expId: record.expId,
        }
      }
    }).then(() => {
      methods.searchQuery();
    });
  }
};

onMounted(() => {
  methods.searchQuery();
});
</script>

<style lang="less" scoped>
</style>
