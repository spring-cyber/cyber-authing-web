<template>
  <c-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="600px"
    title="系统提示"
    okText="确定"
    icon="cyber-tishi"
    @ok="methods.onSubmit"
  >
    <a-form
      ref="formRef"
      name="formName"
      :model="formState"
      :rules="rules"
      v-if="modalState.visible"
      autocomplete="off" layout="vertical"
    >
      <a-form-item :label="modalState.label" name="password">
        <c-input-password v-if="modalState.visible" v-model:value="formState.password"></c-input-password>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios from '@/api';
import { message } from 'ant-design-vue';
import { required, checkPassword, PWD_ENC_KEY, encryption } from 'cyber-web-ui';
const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
  label: '',
});
// 表单信息
const formState = reactive({
  id: undefined,
  password: undefined,
  version: undefined,
});
// 表单校验规则
const rules = reactive({
  password: [required('新密码不能为空'), checkPassword()],
});
const $emit = defineEmits(['ok']);
const methods = {
  async showModal(record) {
    modalState.visible = true;
    modalState.label = `请输入“${record.name}（${record.userName}）”的新密码`;
    Object.keys(formState).forEach(key => formState[key] = record[key]);
    formState.password = undefined;
    nextTick(unref(formRef)?.clearValidate);
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        await unref(formRef).validate();
        let res = await axios.request({
          url: '/auth/user/resetPwd',
          method: 'put',
          data: encryption({
            data: formState,
            param: ['password'],
            key: PWD_ENC_KEY,
          }),
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
