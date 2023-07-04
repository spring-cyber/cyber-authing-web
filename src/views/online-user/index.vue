<template>
  <div>
    <c-page-label title="在线用户" icon="cyber-zaixianyonghu1" document-link="#在线用户">
      <template #tips>维护在线用户相关信息。</template>
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
          v-model:value="queryState.username"
          placeholder="请输入用户账号..."
          style="width: 200px"
          @keydown.enter="methods.searchQuery()"
        >
          <template #suffix><c-icon icon="cyber-sousuo" size="16" color="#BDBDBD" /></template>
        </a-input>
        <a-input
          v-model:value="queryState.ipaddr"
          placeholder="请输入ip地址..."
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
        <template v-if="column.key == 'nickName'">
          <c-cell icon="cyber-zaixianyonghu" :title="record.nickName" />
        </template>
      </template>
    </c-table-wrapper>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import axios from '@/api';
import { changeHistoryState, initHistoryState, Modal } from 'cyber-web-ui';
import { message } from 'ant-design-vue';
const tableRef = ref(); // 表格ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    username: undefined,
    ipaddr: undefined,
    time: [dayjs().format('YYYY-MM-DD') + ' 00:00:00', dayjs().format('YYYY-MM-DD') + ' 23:59:59'],
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '用户姓名', key: "nickName", width: '10%' },
    { title: '用户账号', dataIndex: "username", width: '10%', ellipsis: true },
    { title: '会话编号', dataIndex: "token", width: '20%', ellipsis: true },
    { title: 'IP 地址', dataIndex: "ipaddr", width: '150px' },
    { title: '登录地点', dataIndex: "loginLocation", ellipsis: true },
    { title: '客户端', dataIndex: "client", ellipsis: true, customRender: ({ record }) => `${record.browser || '-'} | ${record.os || '-'}` },
    { title: '登录时间', dataIndex: "loginTime", width: '170px', customRender: ({ text }) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-' },
  ],
  overlayMenu: [
    {
      label: "强制下线",
      handler: (record) => methods.delete(record),
    },
  ],
});

const methods = {
  // 搜索表格
  searchQuery() {
    changeHistoryState(queryState);
    unref(tableRef).searchQuery({
      url: '/auth/online/search',
      method: 'get',
      params: {
        ...queryState,
        time: undefined,
        startDate: queryState.time[0],
        endDate: queryState.time[1],
        sortBy: 'login_time',
        sortType: 'desc',
      },
    });
  },
  // 删除
  delete(record) {
    Modal.confirm({
      content: `是否对${record.username}进行强制下线操作？`,
      onOk: async () => {
        try {
          let res = await axios.request({
            url: `/auth/online/${record.userid}/${record.token}`,
            method: 'delete',
          });
          message.success(res.message);
          methods.searchQuery();
          return Promise.resolve();
        } catch {
          return Promise.reject();
        }
      },
    });
  },
};

onMounted(() => {
  methods.searchQuery();
});
</script>

<style lang="less" scoped>
</style>
