<template>
  <div>
    <c-page-label title="访问控制" icon="cyber-heibaimingdan1" document-link="#访问控制">
      <template #tips>维护用户登录访问控制等相关信息。</template>
    </c-page-label>

    <c-radio-wrapper v-model:value="queryState.type" @change="methods.onRadioChange">
      <c-radio-button
        v-for="item in ACCESS_CONTROL_TYPE"
        :key="item.value"
        :value="item.value"
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
        <c-select
          v-model:value="queryState.strategyType"
          :options="STRATEGY_TYPE"
          placeholder="策略类型"
          width="168px"
          allowClear
          @change="() => {
            queryState.strategyReason = undefined;
            methods.searchQuery();
          }"
        ></c-select>
        <c-select
          v-model:value="queryState.strategyReason"
          :options="tableState.strategyReason(queryState.strategyType)"
          placeholder="策略原因"
          width="168px"
          allowClear
          @change="methods.searchQuery()"
        ></c-select>
        <a-range-picker
          v-model:value="queryState.time"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          valueFormat="YYYY-MM-DD HH:mm:ss"
          @change="methods.searchQuery()"
        ></a-range-picker>
      </template>
      <template #right>
        <a-button type="primary" @click="methods.showModify()">新建</a-button>
      </template>
      <template #bodyCell="{ record, column }">
        <template v-if="column.key == 'name'">
          <c-cell icon="cyber-heibaimingdan">
            {{ queryState.type == '0' ? record.nickName : record.ip }}
          </c-cell>
        </template>
        <template v-if="column.key == 'strategyType'">
          <c-cell-dict :options="STRATEGY_TYPE" :value="record.strategyType"></c-cell-dict>
        </template>
        <template v-if="column.key == 'strategyReason'">
          <c-cell-dict :options="tableState.strategyReason(record.strategyType)" :value="record.strategyReason"></c-cell-dict>
        </template>
      </template>
    </c-table-wrapper>

    <Modify ref="modifyRef" @ok="methods.searchQuery()"></Modify>
  </div>
</template>

<script setup>
import Modify from './modules/Modify.vue';
import { changeHistoryState, initHistoryState, useDict, Modal } from 'cyber-web-ui';
const { ACCESS_CONTROL_TYPE, STRATEGY_TYPE, ENABLE_STRATEGY_REASON, DISABLED_STRATEGY_REASON } = useDict({
  AUTHING: ['ACCESS_CONTROL_TYPE', 'STRATEGY_TYPE', 'ENABLE_STRATEGY_REASON', 'DISABLED_STRATEGY_REASON']
});
const tableRef = ref(); // 表格ref
const modifyRef = ref(); // 弹窗ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    type: '0',
    strategyType: undefined,
    strategyReason: undefined,
    time: [],
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '用户', key: "name", ellipsis: true, show: computed(() => queryState.type == '0') },
    { title: '账号', dataIndex: "userName", ellipsis: true, show: computed(() => queryState.type == '0') },
    { title: 'IP 地址', key: "name", ellipsis: true, show: computed(() => queryState.type == '1')  },
    { title: '策略类型', key: "strategyType", width: '11%' },
    { title: '策略原因', key: "strategyReason", width: '11%' },
    { title: '时间范围', dataIndex: "startTime", width: computed(() => queryState.type == '1' ? '300px' : '19%'), customRender: ({ record, text }) => `${text} ~ ${record.endTime}` },
    { title: '处理人', dataIndex: "updator", width: computed(() => queryState.type == '1' ? '16%' : '12%'), ellipsis: true },
    { title: '处理时间', dataIndex: "updateTime", width: '180px' },
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
  strategyReason: computed(() => {
    return (type) => {
      if(!type) return [];
      return type == '0' ? ENABLE_STRATEGY_REASON.value : DISABLED_STRATEGY_REASON.value;
    }
  })
});

const methods = {
  // 搜索表格
  searchQuery() {
    changeHistoryState(queryState);
    unref(tableRef).searchQuery({
      url: '/auth/accesscontrol/search',
      method: 'get',
      params: {
        ...queryState,
        time: undefined,
        startDate: queryState.time[0],
        endDate: queryState.time[1],
      },
    });
  },
  // 显示弹窗
  showModify(record) {
    unref(modifyRef).showModal({
      ...(record || {}),
      type: queryState.type,
    });
  },
  onRadioChange() {
    queryState.strategyType = undefined;
    queryState.strategyReason = undefined;
    queryState.time = [];
    methods.searchQuery();
  },
  // 删除
  delete(record) {
    let tips = record.type == '0' ? `${record.nickName}` : record.ip;
    Modal.verify({
      content: `是否确认删除“${tips}”的访问策略？`,
      value: record.type == '0' ? record.userName : record.ip,
      params: {
        url: '/auth/accesscontrol',
        method: 'delete',
        params: {
          id: record.id,
          sortBy: 'order_num',
          sortType: 'asc',
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
