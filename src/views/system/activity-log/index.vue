<template>
  <g-page-label title="标题" icon="icon-rongqi">
    <template #tips>提示内容。</template>
  </g-page-label>

  <g-page-body>
    <template #header>
      <g-params :loading="tableState.loading" @search="methods.searchQuery()">
        <!-- 模块标题搜索 -->
        <a-input
          v-model:value="queryParams.title"
          placeholder="输入模块标题搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 业务类型搜索 -->
        <a-input
          v-model:value="queryParams.businessType"
          placeholder="输入业务类型搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 方法名称搜索 -->
        <a-input
          v-model:value="queryParams.method"
          placeholder="输入方法名称搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 请求方式搜索 -->
        <a-input
          v-model:value="queryParams.requestMethod"
          placeholder="输入请求方式搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 请求URL搜索 -->
        <a-input
          v-model:value="queryParams.requestUrl"
          placeholder="输入请求URL搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 客户端地址搜索 -->
        <a-input
          v-model:value="queryParams.clientIp"
          placeholder="输入客户端地址搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 请求参数搜索 -->
        <a-input
          v-model:value="queryParams.requestParam"
          placeholder="输入请求参数搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 返回结果搜索 -->
        <a-input
          v-model:value="queryParams.execResult"
          placeholder="输入返回结果搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 状态（0正常 1停用）搜索 -->
        <a-input
          v-model:value="queryParams.status"
          placeholder="输入状态（0正常 1停用）搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <template #right>
          <a-button type="primary" @click="methods.showModify()">创建</a-button>
        </template>
      </g-params>
    </template>

    <g-table
      ref="tableRef"
      rowKey="id"
      v-model:loading="tableState.loading"
      :columns="tableState.columns"
      :overlayMenu="tableState.overlayMenu"
    ></g-table>
  </g-page-body>

  <Modify ref="modifyRef" @ok="methods.searchQuery()"></Modify>
</template>

<script setup>
import axios from '@/api';
import { message } from 'ant-design-vue';
import { changeHistoryState, initHistoryState } from "@/utils/dispose";
import Modify from './modules/Modify.vue';
import GModal from '@/components/global/modal/g-modal.jsx';

const tableRef = ref(); // 表格ref
const modifyRef = ref(); // 弹窗ref
// 表格请求参数
const queryParams = reactive({
  ...initHistoryState({
    id: undefined,
    title: undefined,
    businessType: undefined,
    method: undefined,
    requestMethod: undefined,
    requestUrl: undefined,
    clientIp: undefined,
    requestParam: undefined,
    execResult: undefined,
    status: undefined,
    tenantCode: undefined,
    deleted: undefined,
    creator: undefined,
    createTime: undefined,
    updator: undefined,
    updateTime: undefined,
    remark: undefined,
    version: undefined,
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    // { title: '日志主键', dataIndex: "id" },
    { title: '模块标题', dataIndex: "title" },
    { title: '业务类型', dataIndex: "businessType" },
    { title: '方法名称', dataIndex: "method" },
    { title: '请求方式', dataIndex: "requestMethod" },
    { title: '请求URL', dataIndex: "requestUrl" },
    { title: '客户端地址', dataIndex: "clientIp" },
    { title: '请求参数', dataIndex: "requestParam" },
    { title: '返回结果', dataIndex: "execResult" },
    { title: '状态（0正常 1停用）', dataIndex: "status" },
    // { title: '租户编码', dataIndex: "tenantCode" },
    // { title: '删除标志（0正常 1删除）', dataIndex: "deleted" },
    // { title: '创建者', dataIndex: "creator" },
    // { title: '创建时间', dataIndex: "createTime" },
    // { title: '更新者', dataIndex: "updator" },
    // { title: '更新时间', dataIndex: "updateTime" },
    // { title: '备注', dataIndex: "remark" },
    // { title: '版本', dataIndex: "version" },
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
});

const methods = {
  // 搜索表格
  async searchQuery() {
    changeHistoryState(queryParams);
    nextTick(() => {
      unref(tableRef).searchQuery({
        url: '/activitylog/search',
        method: 'get',
        data: queryParams,
      });
    });
  },
  // 显示弹窗
  showModify(record) {
    unref(modifyRef).showModal(record);
  },
  delete(record) {
    GModal.confirm({
      title: `删除`,
      icon: 'icon-shanchu',
      content: `确定要删除吗，删除后将无法恢复！`,
      okButtonProps: {
        pattern: 'error',
      },
      onOk: () => {
        return new Promise(async (resolve, reject) => {
          try {
            let res = await axios.request({
              url: '/activitylog',
              method: 'delete',
              params: {
                id: record.id,
              }
            });
            message.success(res.message);
            methods.searchQuery();
            resolve();
          } catch(error) {
            console.log('error', error);
            reject();
          }
        });
      },
    })
  },
};

methods.searchQuery();
</script>

<style lang="less" scoped>
</style>
