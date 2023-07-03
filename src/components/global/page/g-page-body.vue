<template>
  <div class="g-page-body">
    <div
      v-if="showHeader"
      class="g-page-body-header"
      :style="{ padding: padding ? '0 20px' : '0' }"
    >
      <slot name="header"></slot>
    </div>
    <div class="g-page-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  width: {
    type: [String, Number],
    default: "100%",
  },
  padding: {
    type: Boolean,
    default: false,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
});
const width = computed(() => {
  if (typeof props.width == "number") {
    return props.width + "px";
  } else if (typeof props.width == "string") {
    if (props.width.includes("%")) return props.width;
    return props.width.replace("px", "") + "px";
  } else {
    return;
  }
});

</script>

<style lang="less">
.g-page-body {
  display: flex;
  flex-direction: column;
  width: v-bind(width);
  border-radius: @border-radius-base;
  box-shadow: 2px 2px 6px #cecece;
  .g-page-body-header {
    .flex-center();
    width: 100%;
    min-height: 56px;
    background: #FFFFFF;
    flex-wrap: wrap;
    border-radius: 4px 4px 0px 0px;
    box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.06);
    border-radius: @border-radius-base;
  }
  .g-page-content {
    flex: 1;
    height: 0;
    background: #ffffff;
    &::before {
      content: '';
      display: table;
    }
    &::after {
      content: '';
      display: table;
    }
  }
}
</style>
