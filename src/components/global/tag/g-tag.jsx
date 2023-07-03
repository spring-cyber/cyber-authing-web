import { Tag } from 'ant-design-vue';
import theme from '@/assets/style/theme.js'
import { defineComponent, computed } from "vue";
import './g-tag.less';

export default defineComponent({
  props: {
    // 模式 - 按钮颜色
    pattern: {
      type: String,
      default: '',
      validator: (value) => ["", "primary", "dark", "warning", "error", "gray", "classic"].includes(value),
    },
    // 圆角图标
    round: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, emit, expose, slots }) {

    const color = computed(() => {
      return theme[`${props.pattern}-color`];
    });

    return () => {
      return (
        <Tag
          class={['g-tag', props.round ? 'g-round-tag' : ''].join(' ')}
          color={color.value}
          {...{...props, ...attrs}}
        >
          { slots.default?.() }
        </Tag>
      )
    }
  }
});
