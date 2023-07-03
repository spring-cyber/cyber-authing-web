<template>
  <div class="g-card">
    <slot></slot>
  </div>
</template>

<script setup>
</script>

<style lang="less">
.g-card {
  .flex-center();
  width: 100%;
  min-height: 56px;
  background: #FFFFFF;
  flex-wrap: wrap;
  box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.06);
  border-radius: @border-radius-base;
  margin-bottom: 20px;
  padding: 0 20px;
}	
</style>
