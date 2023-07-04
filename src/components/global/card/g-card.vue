<template>
  <div :class="['g-card', { 'g-card-body': !title }]">
    <template v-if="title">
      <div class="g-card-title">{{ title }}</div>
      <div class="g-card-body">
        <slot></slot>
      </div>
    </template>
    <slot v-else></slot>
  </div>
</template>

<script setup>
defineProps({
  title: String,
});
</script>

<style lang="less" scoped>
.g-card {
  margin-bottom: 20px;
  background: #FFFFFF;
  border-radius: @border-radius-base;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.06);
  &.g-card-body {
    padding: 10px 20px;
  }
  .g-card-title {
    display: flex;
    align-items: center;
    height: 56px;
    font-size: 14px;
    font-weight: 600;
    color: #414A5B;
    padding: 0 20px;
  }
  .g-card-body {
    padding: 0 20px 24px;
  }
}
</style>