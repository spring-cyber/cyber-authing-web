<template>
  <div>
    <c-page-label title="组织架构" icon="cyber-zuzhi" document-link="#组织管理">
      <template #tips>管理部门架构相关信息。</template>
    </c-page-label>

    <div class="flex">
      <EnterpriseTree
        ref="enterpriseTreeRef"
        class="mr-20px"
        v-model:enterprise="structureState.enterprise"
        v-model:dept="structureState.dept"
        v-model:user="structureState.user"
        @change="methods.treeChange"
      ></EnterpriseTree>

      <div class="w-0 flex-1">
        <c-radio-wrapper v-model:value="queryState.status" @change="methods.changeRadio">
          <c-radio-button value="0">基本信息</c-radio-button>
          <c-radio-button value="1" v-if="structureState.type != 'user'">成员列表</c-radio-button>
        </c-radio-wrapper>

        <BasicInfo
          v-if="queryState.status == '0'"
          :type="structureState.type"
          :enterprise="structureState.enterprise"
          :dept="structureState.dept"
          :user="structureState.user"
        ></BasicInfo>
        <User
          ref="userRef"
          v-if="queryState.status == '1'"
          :enterprise="structureState.enterprise"
          :dept="structureState.dept"
          :user="structureState.user"
          :subDepts="structureState.subDepts"
          :disabled="structureState.disabled"
          @change="() => enterpriseTreeRef?.searchQuery?.()"
        ></User>
      </div>
    </div>
  </div>
</template>

<script setup>
import { initHistoryState, changeHistoryState } from 'cyber-web-ui';
import User from './modules/User.vue';
import BasicInfo from './modules/BasicInfo.vue';
import EnterpriseTree from './modules/EnterpriseTree.vue';
const userRef = ref();
const enterpriseTreeRef = ref();
const structureState = reactive({
  type: undefined,
  enterprise: undefined,
  dept: undefined,
  user: undefined,
  disabled: false,
  subDepts: undefined,
});
// 表格请求参数
const queryState = reactive({
  ...initHistoryState({
    status: '0',
  }),
});

const methods = {
  changeRadio() {
    changeHistoryState(queryState, true);
    if(queryState.status == '1') {
      nextTick(methods.searchQuery);
    }
  },
  treeChange(type, disabled = false, subDepts) {
    // console.log('type', type, subDepts)
    structureState.type = type;
    structureState.disabled = disabled;
    structureState.subDepts = subDepts;
    queryState.status = type == 'user' ? '0' : queryState.status;
    if(type != 'user' && queryState.status == '1') {
      nextTick(methods.searchQuery);
    }
  },
  searchQuery() {
    unref(userRef).searchQuery();
  }
}
</script>

<style lang="less" scoped>
</style>
