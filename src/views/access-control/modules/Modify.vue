<template>
  <c-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="600px"
    :title="modalState.title"
    :okText="modalState.okText"
    @ok="methods.onSubmit"
  >
    <a-form
      ref="formRef"
      name="formName"
      :model="formState"
      :rules="rules"
      autocomplete="off" layout="vertical"
    >
      <a-form-item label="用户ID" name="userId" v-if="formState.type == '0'">
        <c-user-select v-model:value="formState.userId" placeholder="请选择用户"></c-user-select>
      </a-form-item>
      <a-form-item label="IP 地址" name="ip" v-if="formState.type == '1'">
        <a-input v-model:value="formState.ip" placeholder="设置登录IP限制，多个匹配项以;分隔，支持匹配（*通配、网段）"></a-input>
      </a-form-item>
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="策略类型" name="strategyType">
          <c-select
            v-model:value="formState.strategyType"
            :options="STRATEGY_TYPE"
            placeholder="请选择类型"
            @change="formState.strategyReason = undefined"
          ></c-select>
        </a-form-item>
        <a-form-item label="策略原因" name="strategyReason">
          <c-select
            v-model:value="formState.strategyReason"
            :options="modalState.strategyReason"
            placeholder="请选择策略原因"
          ></c-select>
        </a-form-item>
      </div>
      <a-form-item label="时间范围" name="time">
        <a-range-picker
          v-model:value="formState.time"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          valueFormat="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        ></a-range-picker>
      </a-form-item>
      <a-form-item label="策略描述" name="description">
        <a-textarea v-model:value="formState.description" placeholder="请输入描述信息..." show-count :maxlength="120"></a-textarea>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios, { queryDetail } from '@/api';
import { message } from 'ant-design-vue';
import { required, useDict } from 'cyber-web-ui';
const { STRATEGY_TYPE, ENABLE_STRATEGY_REASON, DISABLED_STRATEGY_REASON } = useDict({
  AUTHING: ['STRATEGY_TYPE', 'ENABLE_STRATEGY_REASON', 'DISABLED_STRATEGY_REASON']
});
const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
  isCreate: true,
  title: computed(() => {
    return modalState.isCreate
      ? formState.type == '0' ? '新建用户策略' : '新建 IP策略'
      : formState.type == '0' ? '编辑用户策略' : '编辑 IP策略'
  }),
  okText: computed(() => modalState.isCreate ? '新建' : '确定'),
  strategyReason: computed(() => {
    if(!formState.strategyType) return [];
    return formState.strategyType == '0' ? ENABLE_STRATEGY_REASON.value : DISABLED_STRATEGY_REASON.value;
  })
});
// 表单信息
const formState = reactive({
  id: undefined,
  ip: undefined,
  userId: undefined,
  type: undefined,
  strategyType: undefined,
  strategyReason: undefined,
  time: [],
  description: undefined,
  version: undefined,
});
// 表单校验规则
const rules = {
  ip: required(),
  userId: required(),
  strategyType: required(),
  strategyReason: required(),
  time: required(),
};
const $emit = defineEmits(['ok']);
const methods = {
  async showModal(record) {
    modalState.visible = true;
    modalState.isCreate = !record?.id;
    let detail = await queryDetail('/auth/accesscontrol', record);
    Object.keys(formState).forEach(key => {
      formState[key] = detail[key];
    });
    if(!modalState.isCreate) {
      formState.time = [detail.startTime, detail.endTime];
    }
    nextTick(unref(formRef)?.clearValidate);
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        // 请求添加/修改接口
        let res = await axios.request({
          url: '/auth/accesscontrol',
          method: modalState.isCreate ? 'post' : 'put',
          data: {
            ...formState,
            time: undefined,
            startTime: formState.time[0],
            endTime: formState.time[1],
          }
        });
        message.success(res.message);
        $emit('ok');
        resolve();
      } catch (error) {
        console.log('error', error);
        reject();
      }
    })
  },
};

defineExpose({
  showModal: methods.showModal,
});
</script>

<style lang="less" scoped>
</style>
