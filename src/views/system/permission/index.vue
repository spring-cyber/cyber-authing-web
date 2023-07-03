<template>
  <g-page-label title="标题" icon="icon-rongqi">
    <template #tips>提示内容。</template>
  </g-page-label>

  <g-page-body>
    <template #header>
      <g-params :loading="tableState.loading" @search="methods.searchQuery()">
        <!-- 权限名称搜索 -->
        <a-input
          v-model:value="queryParams.name"
          placeholder="输入权限名称搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 路由地址搜索 -->
        <a-input
          v-model:value="queryParams.path"
          placeholder="输入路由地址搜索..."
          @keydown.enter="methods.searchQuery()"
        ></a-input>
        <!-- 权限类型（1菜单 2接口）搜索 -->
        <a-input
          v-model:value="queryParams.type"
          placeholder="输入权限类型（1菜单 2接口）搜索..."
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
    name: undefined,
    path: undefined,
    type: undefined,
    perms: undefined,
    productCode: undefined,
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
    // { title: 'ID', dataIndex: "id" },
    { title: '权限名称', dataIndex: "name" },
    { title: '路由地址', dataIndex: "path" },
    { title: '权限类型（1菜单 2接口）', dataIndex: "type" },
    { title: '权限标识', dataIndex: "perms" },
    // { title: '产品编码', dataIndex: "productCode" },
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
        url: '/permission/search',
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
              url: '/permission',
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
