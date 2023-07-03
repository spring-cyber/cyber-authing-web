<template>
  <a-dropdown
    class="define-dropdown"
    destroyPopupOnHide
    trigger="click"
    overlayClassName="g-dropdown-overlay"
    :placement="placement"
    v-bind="$attrs"
  >
    <template v-for="slotName in Object.keys($slots)" #[slotName]>
      <slot :name="slotName"></slot>
    </template>
    <!-- 下拉菜单列表 -->
    <template #overlay v-if="overlayMenu.length > 0">
      <slot name="overlay">        
        <a-menu class="g-dropdown-menu">
          <a-menu-item
            v-for="(item, index) in overlayMenu"
            :key="index"
            :icon="item.icon"
            :disabled="item.disabled"
          >
            <slot name="record" :dropItem="item">
              <a @click="item.handler(item)">{{ item?.label }}</a>
            </slot>
          </a-menu-item>
        </a-menu>
      </slot>
    </template>
  </a-dropdown>
</template>

<script setup>
const props = defineProps({
  overlay: {
    type: Array,
    default: () => [],
  },
  placement: {
    type: String,
    default: 'bottomRight',
  },
});

const overlayMenu = computed(() => {
  return props.overlay.filter(item => {
    return typeof item.show == 'boolean' ? item.show : true;
  }).map(item => {
    return {
      ...item,
      disabled: typeof item.disabled == 'boolean' ? item.disabled : false,
    };
  });
});
</script>

<style lang="less">
.ant-dropdown {
  .ant-dropdown-menu {
    .ant-dropdown-menu-item:hover,
    .ant-dropdown-menu-submenu-title:hover {
      .main-body-deepen();
      background-color: @primary-bg-color !important;
    }
  }
}
.g-dropdown-overlay {

}
.g-dropdown-menu.ant-dropdown-menu {
  margin: 0;
  padding: 8px 0;
  min-width: 168px;
  border-radius: @border-radius-base;
  background-color: #fff;
}
</style>