<template>
  <div>
    <c-page-label title="用户授权" icon="cyber-shouquan1" document-link="#用户授权">
      <template #tips>维护用户授权相关信息。</template>
    </c-page-label>

    <div class="flex">
      <c-product-tree v-model:value="queryState.productId" @change="methods.onChange"></c-product-tree>

      <div class="w-0 flex-1 ml-20px">
        <c-table-wrapper
          rowKey="id"
          ref="tableRef"
          v-model:loading="tableState.loading"
          :columns="tableState.columns"
          :overlayMenu="tableState.overlayMenu"
          @search="methods.searchQuery"
        >
          <template #collapse>
            <c-user-select
              v-model:value="queryState.userId"
              width="168"
              allowClear
              placeholder="用户"
              @change="methods.searchQuery()"
            ></c-user-select>
            <c-role-select
              v-model:value="queryState.roleId"
              width="168"
              allowClear
              placeholder="角色"
              :productId="queryState.productId"
              @change="methods.searchQuery()"
            ></c-role-select>
            <!-- 角色ID搜索 -->
            <a-input
              v-model:value="queryState.name"
              placeholder="请输入用户名称、手机号搜索..."
              style="width: 256px"
              @keydown.enter="methods.searchQuery()"
            >
              <template #suffix><c-icon icon="cyber-sousuo" size="16" color="#BDBDBD" /></template>
            </a-input>
          </template>
          <template #right>
            <a-button type="primary" ghost :disabled="!queryState.productId" @click="methods.showModify()">新建授权</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key == 'name'">
              <c-cell icon="cyber-shouquan" :title="record.name"></c-cell>
            </template>
            <template v-if="column.key == 'status'">
              <c-cell-dict :options="STATUS" :value="record.status"></c-cell-dict>
            </template>
            <template v-if="column.key == 'roleId'">
              <a-tag color="green" v-for="(item, index) in record.roleId" :key="index">
                {{ item.name }}
              </a-tag>
            </template>
          </template>
        </c-table-wrapper>
      </div>
    </div>
    <Modify ref="modifyRef" @ok="methods.searchQuery()"></Modify>
  </div>
</template>

<script setup>
import { changeHistoryState, initHistoryState, useDict, Modal } from 'cyber-web-ui';
import Modify from './modules/Modify.vue';
import { message } from 'ant-design-vue';
const { STATUS } = useDict({ COMMON: ['STATUS'] });
const tableRef = ref(); // 表格ref
const modifyRef = ref(); // 弹窗ref
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    productId: undefined,
    userId: undefined,
    roleId: undefined,
    name: undefined,
  }),
});
// 表格信息
const tableState = reactive({
  loading: false,
  columns: [
    { title: '用户名称', key: "name", ellipsis: true },
    { title: '用户账号', dataIndex: "userName", ellipsis: true },
    { title: '角色列表', key: "roleId", ellipsis: true },
    { title: '授权状态', key: "status", ellipsis: true },
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
  ],
  appNode: {},
  parentNode: {},
});

const methods = {
  onChange(node, parentNode) {
    tableState.appNode = node || {};
    tableState.parentNode = parentNode || {};
    nextTick(methods.searchQuery);
  },
  // 搜索表格
  searchQuery() {
    if(!queryState.productId) {
      message.warning('请先选择应用！');
      return;
    }
    changeHistoryState(queryState);
    unref(tableRef).searchQuery({
      url: '/auth/userrole/search',
      method: 'get',
      params: {
        ...queryState,
        phone: queryState.name,
        sortBy: 'update_time',
        sortType: 'desc',
      },
    });
  },
  // 显示弹窗
  showModify(record) {
    unref(modifyRef).showModal({
      productId: tableState.appNode.id,
      productName: tableState.appNode.name,
      ...(record || {}),
    });
  },
  // 删除
  delete(record) {
    Modal.verify({
      content: `是否确认删除“${record.name}”的授权及其相关数据？`,
      value: record.name,
      params: {
        url: '/auth/userrole',
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
</script>

<style lang="less" scoped>
</style>
