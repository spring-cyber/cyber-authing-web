<template>
  <g-page-label title="标题" icon="icon-rongqi">
    <template #tips>提示内容。</template>
  </g-page-label>

  <g-page-body>
    <template #header>
      <g-params :loading="tableState.loading" @search="methods.searchQuery()">
                  <!-- 用户ID搜索 -->
          <a-input
            v-model:value="queryParams.id"
            placeholder="输入用户ID搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 用户名称搜索 -->
          <a-input
            v-model:value="queryParams.name"
            placeholder="输入用户名称搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 用户昵称搜索 -->
          <a-input
            v-model:value="queryParams.nickname"
            placeholder="输入用户昵称搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 用户类型（0系统用户）搜索 -->
          <a-input
            v-model:value="queryParams.type"
            placeholder="输入用户类型（0系统用户）搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 用户邮箱搜索 -->
          <a-input
            v-model:value="queryParams.email"
            placeholder="输入用户邮箱搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 手机号码搜索 -->
          <a-input
            v-model:value="queryParams.phoneNumber"
            placeholder="输入手机号码搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 用户性别（0男 1女 2未知）搜索 -->
          <a-input
            v-model:value="queryParams.sex"
            placeholder="输入用户性别（0男 1女 2未知）搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 头像地址搜索 -->
          <a-input
            v-model:value="queryParams.avatar"
            placeholder="输入头像地址搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 租户编码搜索 -->
          <a-input
            v-model:value="queryParams.tenantCode"
            placeholder="输入租户编码搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 状态（0正常 1停用）搜索 -->
          <a-input
            v-model:value="queryParams.status"
            placeholder="输入状态（0正常 1停用）搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 删除标志（0正常 1删除）搜索 -->
          <a-input
            v-model:value="queryParams.deleted"
            placeholder="输入删除标志（0正常 1删除）搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 创建者搜索 -->
          <a-input
            v-model:value="queryParams.creator"
            placeholder="输入创建者搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 创建时间搜索 -->
          <a-input
            v-model:value="queryParams.createTime"
            placeholder="输入创建时间搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 更新者搜索 -->
          <a-input
            v-model:value="queryParams.updator"
            placeholder="输入更新者搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 更新时间搜索 -->
          <a-input
            v-model:value="queryParams.updateTime"
            placeholder="输入更新时间搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 备注搜索 -->
          <a-input
            v-model:value="queryParams.remark"
            placeholder="输入备注搜索..."
            @keydown.enter="methods.searchQuery()"
          ></a-input>
          <!-- 版本搜索 -->
          <a-input
            v-model:value="queryParams.version"
            placeholder="输入版本搜索..."
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
    nickname: undefined,
    type: undefined,
    email: undefined,
    phoneNumber: undefined,
    sex: undefined,
    avatar: undefined,
    tenantCode: undefined,
    status: undefined,
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
    // { title: '用户ID', dataIndex: "id" },
    { title: '用户名称', dataIndex: "name", width: '18%' },
    // { title: '用户昵称', dataIndex: "nickname" },
    // { title: '用户类型（0系统用户）', dataIndex: "type" },
    // { title: '用户邮箱', dataIndex: "email" },
    // { title: '手机号码', dataIndex: "phoneNumber" },
    { title: '用户性别（0男 1女 2未知）', dataIndex: "sex", width: '18%' },
    { title: '籍贯', dataIndex: "" },
    // { title: '头像地址', dataIndex: "avatar" },
    // { title: '租户编码', dataIndex: "tenantCode" },
    { title: '描述', dataIndex: "remark" },
    { title: '状态（0正常 1停用）', dataIndex: "status", width: '18%' },
    // { title: '创建者', dataIndex: "creator" },
    // { title: '创建时间', dataIndex: "createTime" },
    // { title: '更新者', dataIndex: "updator" },
    // { title: '更新时间', dataIndex: "updateTime" },
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
        url: '/user/search',
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
              url: '/user',
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
