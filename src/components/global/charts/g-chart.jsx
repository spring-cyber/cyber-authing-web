import * as echarts from 'echarts';
import { maintainStore } from '@/store';
import { defineComponent, computed, ref } from "vue";

export default defineComponent({
  props: {
    options: Object,
    // echart.resize
    resize: {
      type: Boolean,
      default: true,
    },
    // 重新渲染
    rerender: {
      type: Boolean,
      default: false,
    }
  },
  setup(props, { attrs, emit, expose, slots }) {
    let instance = reactive({});
    const chartRef = ref();
    const $maintainStore = maintainStore();
    const chartState = reactive({
      resizeSymbol: undefined,
    });
    
    const methods = {
      // 初始化
      init() {
        methods.dispose();
        instance = echarts.init(chartRef.value);
        // 是否开启echart.resize
        if(props.resize) {
          chartState.resizeSymbol = Symbol('g-chart');
          // 添加到echarts公共resize状态管理
          $maintainStore.setResize(chartState.resizeSymbol, methods.resize)
        }
      },
      // 更新图表
      setOption(options) {
        // 重新渲染
        if(props.rerender) {
          methods.init();
        } {
          options && instance.setOption(options);
        }
      },
      // 重置大小
      resize() {
        instance.resize();
      },
      // 销毁
      dispose() {
        if(chartState.resizeSymbol) $maintainStore.removeResize(chartState.resizeSymbol);
        instance?.dispose?.();
        instance = undefined;
      }
    };

    onMounted(() => {
      methods.init();
      methods.resize();
      watch(() => props.options, (options) => {
        methods.setOption(options);
      }, { immediate: true, deep: true })
    });
    onUnmounted(() => {
      methods.dispose();
    });
    expose({
      instance: computed(() => instance),
      resize: methods.resize,
      dispose: methods.dispose,
    });

    return () => {
      return <div ref={chartRef} class="g-chart"></div>
    }
  }
});
