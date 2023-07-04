<template>
  <div v-if="list?.length" class="list-body">
    <div class="list-container">
      <div v-for="(item, index) in list" :key="index" class="list-item">
        <template v-if="type == 'log'">
          <div class="list-item-top">
            <div>{{ item.operName }}</div>
            <div>{{ item.operTime }}</div>
          </div>
          <div>【{{ item.requestMethod }} | <span :class="[item.status == '0' ? 'primary-color' : 'error-color']">{{ item.status == '0' ? '成功' : '失败' }}</span>】{{ item.operUrl }}</div>
        </template>
        <template v-else-if="type == 'online'">
          <div class="list-item-top">
            <div>{{ item.nickName }}</div>
            <!-- <div>{{ item.operTime }}</div> -->
          </div>
          <div>【{{ item.username || '-' }} | {{ item.loginLocation || '-' }} | {{ item.browser || '-' }} | {{ item.os || '-' }}】{{ item.time }}</div>
        </template>
      </div>
    </div>
  </div>
  <a-empty v-else></a-empty>
</template>

<script setup>
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: '',
  }
});
</script>

<style lang="less" scoped>
.list-body {
  padding: 4px 20px;
  height: 550px;
  .list-container {
    height: 100%;
    overflow-y: auto;
    .list-item {
      font-size: 12px;
      font-weight: normal;
      line-height: 20px;
      letter-spacing: 0em;
      color: #666666; 
      border-bottom: 1px solid #EFF1F6;
      padding-bottom: 14px;
      margin-right: 8px;
      margin-bottom: 12px;
      word-break: break-all;
      .list-item-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #2D3D48;
        margin-bottom: 8px;
      }
    }
  }
}
</style>