<template>
  <div>
    <c-page-label title="总览" icon="cyber-zonglan" document-link="#总览">
      <template #tips>用户中心应用数据总览。</template>
    </c-page-label>

    <div class="overview-body">
      <div class="overview-body-left">
        <div class="grid grid-cols-2 gap-x-20px">
          <g-card v-for="(item, index) in overviewState.dataStatistics" :key="index" :title="item.title">
            <div class="grid grid-cols-3 gap-x-20px">
              <div class="statistics-item" v-for="(citem, cindex) in item.list" :key="cindex">
                <div>{{ citem.label }}</div>
                <div :class="['number', citem.color]">{{ citem.value }}</div>
              </div>
            </div>
          </g-card>
        </div>
        <div class="chart-statistics">
          <a-tabs v-model:activeKey="overviewState.trendActiveKey">
            <a-tab-pane key="1" tab="在线趋势">
              <g-chart :options="overviewState.onlineTrend" class="h-350px"></g-chart>
            </a-tab-pane>
            <a-tab-pane key="2" tab="用户趋势">
              <div class="h-350px"></div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
      <div class="overview-body-right">
        <a-tabs v-model:activeKey="overviewState.activeKey" @change="methods.onChangeOper()">
          <a-tab-pane key="1" tab="实时日志">
            <List type="log" :list="overviewState.log"></List>
          </a-tab-pane>
          <a-tab-pane key="2" tab="在线用户">
            <List type="online" :list="overviewState.online"></List>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from '@/api';
import dayjs from 'dayjs';
import List from './modules/List.vue';
import { lineChart } from '@/utils/echarts/options.js';

const overviewState = reactive({
  activeKey: '1',
  trendActiveKey: '1',
  organ: {},
  real: {},
  log: [],
  online: [],
  onlineTrend: {},
  dataStatistics: computed(() => {
    const { organ = {}, real = {}, } = overviewState;
    return [
      {
        title: '组织数据',
        list: [
          { label: '企业数量', value: organ.enterpriseCount || '0' },
          { label: '部门数量', value: organ.deptCount || '0' },
          { label: '用户数量', value: organ.userCount || '0' },
        ]
      },
      {
        title: '实时数据',
        list: [
          { label: '在线用户', value: real.onLineUserCount || '0', color: 'blue-color' },
          { label: '访问策略', value: real.accessStrategyCount || '0', color: 'error-color' },
          { label: '待处理异常', value: real.pendingExceptionCount || '0', color: 'warning-color' },
        ]
      },
    ]
  })
});

const methods = {
  async searchQuery() {
    let res = await Promise.allSettled([
      methods.queryOrgan(),
      methods.queryReal(),
    ]);
    overviewState.organ = res[0].value?.data || {};
    overviewState.real = res[1].value?.data || {};
    methods.onChangeOper();
    methods.queryOnlineTrend();
  },
  // 组织数据
  queryOrgan() {
    return axios.request({
      url: '/auth/overview/organ',
      method: 'get',
    });
  },
  // 实时数据
  queryReal() {
    return axios.request({
      url: '/auth/overview/real',
      method: 'get',
    });
  },
  onChangeOper() {
    if(overviewState.activeKey == '1') methods.querySysoperlog();
    else methods.queryOnline();
  },
  // 实时日志
  async querySysoperlog() {
    let res = await axios.request({
      url: '/auth/sysoperlog/search',
      method: 'get',
      params: {
        pageSize: 200,
        page: 1,
        sortBy: 'oper_time',
        sortType: 'desc',
      },
    });
    overviewState.log = res?.data?.data || [];
  },
  // 在线用户
  async queryOnline() {
    let res = await axios.request({
      url: '/auth/online/search',
      method: 'get',
      params: { pageSize: 9999, page: 1 },
    });
    overviewState.online = (res?.data?.data || []).map(item => ({
      ...item,
      time: item.loginTime ? dayjs(item.loginTime).format('YYYY-MM-DD HH:mm:ss') : '',
    }));
  },
  // 在线趋势
  async queryOnlineTrend() {
    let res = await axios.request({
      url: '/auth/overview/online',
      method: 'get',
    });
    overviewState.onlineTrend = methods.generateLineChart(res.data);
  },
  // 生成折线图
  generateLineChart(data = []) {
    return {
      title: {
        "show": false,
      },
      grid: {
        "left": 60,
        "top": 40,
        "bottom": 46,
        "right": 40
      },
      legend: {
        "show": false,
      },
      xAxis: [{
        ...lineChart.xAxis,
        data: data.map(item => item.accessTime),
      }],
      yAxis: lineChart.yAxis,
      tooltip: {
        ...lineChart.tooltip,
      },
      series: [{
        ...lineChart.lineSeries,
        data: data.map(item => item.count),
      }],
    };
  },
};

methods.searchQuery();
</script>

<style lang="less" scoped>
.overview-body {
  display: flex;
  justify-content: space-between;
  .overview-body-left {
    width: 0;
    flex: 1;
    .statistics-item {
      height: 100px;
      padding: 12px 0 12px 20px;
      background: #F1F5F9;
      border-radius: @border-radius-base;
      font-weight: normal;
      color: #2D3D48;
      white-space: nowrap;
      & > .number {
        margin-top: 20px;
        font-size: 18px;
        &.blue-color {
          color: #2476F1;
          &::selection {
            background: #2476F1;
          }
        }
      }
    }
    .chart-statistics {
      background: #FFFFFF;
      border-radius: @border-radius-base;
      box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.06);
    }
  }
  .overview-body-right {
    width: 28%;
    min-width: 320px;
    max-width: 450px;
    margin-left: 20px;
    background: #FFFFFF;
    border-radius: @border-radius-base;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.06);
  }
  :deep(.ant-tabs) {
    .ant-tabs-tab {
      padding: 19px 10px;
      &:first-child {
        margin-left: 20px;
      }
      & + .ant-tabs-tab {
        margin-left: 0;
      }
    }
  }
}
</style>
