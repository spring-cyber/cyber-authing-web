<template>
  <c-tree-body>
    <template #header>
      <div class="grid grid-flow-col gap-x-20px">
        <a-input
          v-model:value="treeState.userName"
          placeholder="搜索用户"
          @change="methods.searchUser()"
        >
          <template #suffix><c-icon icon="cyber-sousuo" size="16" color="#BDBDBD" /></template>
        </a-input>
        <a-dropdown trigger="click">
          <a-button type="primary" ghost>新建</a-button>
          <template #overlay>
            <a-menu class="w-120px pt-7px pb-7px">
              <a-menu-item @click="methods.showModal({ type: 'enterprise' })">新建企业</a-menu-item>
              <a-menu-item @click="methods.showModal({ type: 'dept' })">新建部门</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </template>
    
    <a-tree
      block-node
      :height="650"
      :fieldNames="{ title: 'name', key: 'id' }"
      v-model:selectedKeys="treeState.selectedKeys"
      v-model:expandedKeys="treeState.expandedKeys"
      :tree-data="treeState.treeData"
      class="organization-structure-tree"
      @select="methods.onSelect"
      @expand="methods.onExpand"
    >
      <template #title="record">
        <div class="enterprise-tree-node">
          <span
            :class="[
              { 'enterprise-tree-node-highlight': treeState.highlight[record.id] },
              { 'enterprise-tree-node-disuse': record.status == '1' }
            ]"
            :title="record.name"
          >{{ record.name }}</span>
          <a-dropdown v-if="treeState.selectedKeys?.[0] == record.id" trigger="click">
            <c-icon icon="cyber-caozuo" size="16px" @click.stop></c-icon>
            <template #overlay>
              <a-menu class="w-120px pt-7px pb-7px">
                <a-menu-item @click="methods.showModal(record)">编辑</a-menu-item>
                <a-menu-item @click="methods.delete(record)">删除</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </template>
    </a-tree>
    <DeptModify ref="deptRef" @ok="methods.searchQuery()"></DeptModify>
    <EnterpriseModify ref="enterpriseRef"  @ok="methods.searchQuery()"></EnterpriseModify>
    <UserModify ref="userRef"  @ok="methods.searchQuery()"></UserModify>
  </c-tree-body>
</template>

<script setup>
import axios from '@/api';
import { changeHistoryState, initHistoryState, Modal } from 'cyber-web-ui';
import EnterpriseModify from '@/views/enterprise/modules/Modify.vue';
import DeptModify from '@/views/dept/modules/Modify.vue';
import UserModify from '@/views/user/modules/Modify.vue';
const deptRef = ref();
const enterpriseRef = ref();
const userRef = ref();
const treeState = reactive({
  treeData: [],
  selectedKeys: [],
  expandedKeys: [],
  type: '',
  highlight: {},
  userName: undefined,
});
const queryState = reactive({
  ...initHistoryState({
    enterprise: undefined,
    dept: undefined,
    user: undefined,
  }),
});

const $emit = defineEmits(['update:enterprise', 'update:dept', 'update:user', 'change']);
const methods = {
  async searchQuery() {
    changeHistoryState(queryState);
    try {
      let res = await axios.request({
        url: '/auth/enterprise/user/tree',
        method: 'get',
      });
      treeState.treeData = methods.initTreeData(res.data || []);
    } catch(e) {
      treeState.treeData = [];
      throw Error(e);
    }
    if(!treeState.treeData?.length) return;
    let subDepts = [];
    let expandedList = [];
    let enterpriseRecord = undefined;
    let deptRecord = undefined;
    let userRecord = undefined;
    try {
      let { enterprise, dept, user } = queryState;
      if(!enterprise) throw Error;
      // 查找企业
      enterpriseRecord = treeState.treeData.find(item => item.id == enterprise);
      if(!enterpriseRecord) throw Error;
      // 展开列表
      expandedList.push(enterpriseRecord);
      // 查找部门
      if(dept && JSON.stringify(enterpriseRecord).includes(`"id":"${dept}"`)) {
        let { node, expanded } = methods.initTreeExpanded(enterpriseRecord.children, 'id', dept);
        deptRecord = node;
        expandedList = [...expandedList, ...expanded];
        if(!node) dept = undefined;
      }
      // 查找用户
      if(user && JSON.stringify(enterpriseRecord).includes(`"userId":"${user}"`)) {
        let children = deptRecord?.children?.length && deptRecord?.children || enterpriseRecord?.children;
        if(children?.length) {
          let { node, expanded } = methods.initTreeExpanded(children, 'userId', user);
          userRecord = node;
          expandedList = [...expandedList, ...expanded];
          if(!node) user = undefined;
        }
      }
      treeState.type = userRecord ? 'user' : deptRecord ? 'dept' : 'enterprise';
      queryState.enterprise = enterpriseRecord?.id;
      queryState.dept = deptRecord?.id;
      queryState.user = userRecord?.userId;
    } catch(error) {
      // console.log('error', error);
      treeState.type = 'enterprise';
      enterpriseRecord = treeState.treeData[0]
      queryState.enterprise = enterpriseRecord.id;
      queryState.dept = undefined;
      queryState.user = undefined;
    }
    treeState.expandedKeys = expandedList.map(item => item.id);
    let target = treeState.type == 'user' ? userRecord : treeState.type == 'dept' ? deptRecord : enterpriseRecord;
    treeState.selectedKeys = [target.id];
    methods.getSubDeptList(enterpriseRecord, queryState[treeState.type], subDepts);
    $emit('update:enterprise', queryState.enterprise);
    $emit('update:dept', queryState.dept);
    $emit('update:user', queryState.user);
    $emit('change', treeState.type, target.status == '1', subDepts);
  },
  // 初始化树数据
  initTreeData(list, parent) {
    return list.map(item => {
      if(parent?.status == '1') {
        item.status = '1';
      }
      methods.initTreeData(item.children || [], item);
      return item;
    });
  },
  // 初始化展开项
  initTreeExpanded(list, key, value, options = { node: undefined, expanded: [], }) {
    list.some(item => {
      if(item[key] == value) {
        options.node = item;
        options.expanded.push(item);
        return true;
      }
      if(!item.children?.length) return false;
      if(!JSON.stringify(item).includes(`"${key}":"${value}"`)) return false;
      options.expanded.push(item);
      methods.initTreeExpanded(item.children, key, value, options);
      return true;
    });
    return options;
  },
  // 获取 企业/部门 下所有部门
  getSubDeptList(node, id, list = [], isChild = false) {
    if(node.type == 'user') return;
    if(isChild) {
      list.push(node.id);
    } else {
      isChild = node.id == id;
    }
    (node.children || []).some(item => {
      return methods.getSubDeptList(item, id, list, isChild);
    });
    return node.id == id;
  },
  onSelect(selectedKeys, {selected, selectedNodes, node, event}) {
    if(!selected) {
      treeState.selectedKeys = [node.id];
      return;
    }
    treeState.type = node.type;
    selectedKeys = selectedKeys[0];
    if(treeState.type == 'enterprise') {
      queryState.dept = undefined;
      queryState.user = undefined;
      queryState.enterprise = selectedKeys;
    } else if(treeState.type == 'dept') {
      let find = treeState.treeData.find(item => JSON.stringify(item).includes(`"id":"${selectedKeys}"`));
      queryState.enterprise = find?.id;
      queryState.dept = selectedKeys;
      queryState.user = undefined;
    } else {
      let find = treeState.treeData.find(item => JSON.stringify(item).includes(`"id":"${selectedKeys}"`));
      queryState.enterprise = find.id;
      queryState.dept = find.id == node.parent.key ? undefined : node.parent.key;
      queryState.user = node.userId;
    }
    let subDepts = [];
    methods.getSubDeptList(node, queryState[treeState.type], subDepts);
    $emit('update:enterprise', queryState.enterprise);
    $emit('update:dept', queryState.dept);
    $emit('update:user', queryState.user);
    $emit('change', treeState.type, node.status == '1', subDepts)
    changeHistoryState(queryState);
  },
  onExpand(expandedKeys, {expanded: bool, node}) {
    treeState.expandedKeys = expandedKeys;
  },
  async showModal(record) {
    try {
      if(record.type == 'enterprise') unref(enterpriseRef).showModal(record);
      else if(record.type == 'dept') unref(deptRef).showModal(record);
      else unref(userRef).showModal({ ...record, id: record.userId });
    } catch(e) {
      if(e) throw Error(e);
    }
  },
  delete(record) {
    Modal.verify({
      content: `是否确认删除“${record.name}”的${
        record.type == 'dept' ? '部门' : record.type == 'user' ? '用户' : '企业'
      }及其相关数据？`,
      value: record.name,
      params: {
        url: `/auth/${record.type}`,
        method: 'delete',
        params: {
          id: record.type == 'user' ? record.userId : record.id,
        }
      }
    }).then(() => {
      methods.searchQuery();
    });
  },
  // 搜索用户
  searchUser() {
    treeState.highlight = {};
    treeState.expandedKeys = [];
    if(!treeState.userName) {
      treeState.highlight = [];
      return;
    }
    let expanded = methods.getSearchExpandedTree(treeState.treeData, treeState.userName);
    treeState.expandedKeys = expanded.filter(item => {
      if(item.type == 'user') {
        treeState.highlight[item.id] = true;
      }
      return item.type != 'user';
    }).map(item => item.id);
  },
  // 获取搜索展开树
  getSearchExpandedTree(list, userName, expanded = []) {
    let includesUser = false;
    let isEnterprise = false;
    list.forEach(item => {
      if(item.type == 'enterprise') isEnterprise = true;
      if(item.type != 'user') {
        if(!item.children?.length) return;
        let str = JSON.stringify(item);
        if(!str.includes('"type":"user"') || !new RegExp(`"name":"([^"])*${userName}([^"])*"`).test(str)) return;
        if(methods.getSearchExpandedTree(item.children, userName, expanded)) {
          expanded.push(item);
          includesUser = true;
        }
        return;
      }
      if(item.name.includes(userName)) {
        expanded.push(item);
        includesUser = true;
      }
    });
    if(isEnterprise) return expanded;
    else return includesUser;
  },
};

methods.searchQuery();

defineExpose({
  searchQuery: methods.searchQuery,
});
</script>

<style lang="less" scoped>
.organization-structure-tree {
  .enterprise-tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }
  .ant-tree-treenode {
    .enterprise-tree-node-disuse {
      color: #BDBDBD;
    }
    &.ant-tree-treenode-selected {
      .enterprise-tree-node-disuse {
        color: hardlight(@primary-color, #FFFFFF33);
      }
    }
    .enterprise-tree-node-highlight {
      color: @primary-color;
      &.enterprise-tree-node-disuse {
        color: hardlight(@primary-color, #FFFFFF33);
      }
    }
  }
}
</style>
