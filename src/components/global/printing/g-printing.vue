<template>
  <div class="g-printing-body">
    <iframe ref="printRef" :name="iframeName" v-show="false"></iframe>
    <div ref="bodyRef">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { generateRandomCode } from '@/utils/dispose';
const printRef = ref();
const bodyRef = ref();
const iframeName = `iframe-${generateRandomCode()}`; // iframe名称
const methods = {
  print() {
    //将iframe标签里的body结构换成需要打印的内容
    printRef.value.contentDocument.body.innerHTML = bodyRef.value.innerHTML;
    printRef.value.contentDocument.body.style.margin = "0";
    //调用iframe这个子窗口的打印方法
    window.frames[iframeName].print();
  },
};

defineExpose({
  print: methods.print,
});
</script>
