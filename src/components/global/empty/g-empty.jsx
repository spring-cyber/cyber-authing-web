import { Empty } from 'ant-design-vue';
import { defineComponent, computed } from "vue";

export default defineComponent({
  props: {},
  setup(props, { attrs, emit, expose, slots }) {
    
    const simpleImage = computed(() => {
      return Empty.PRESENTED_IMAGE_SIMPLE
    });

    return () => {
      <Empty
        image={simpleImage}
        {...{...props, ...attrs}}
      ></Empty>
    }
  }
});
