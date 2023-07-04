<template>
  <c-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="600px"
    title="封禁操作"
    @ok="methods.onSubmit"
  >
    <a-form
      ref="formRef"
      name="disabled-user"
      :model="formState"
      :rules="rules"
      autocomplete="off" layout="vertical"
    >
      <a-form-item label="类型" name="type">
        <c-select v-model:value="formState.type" :options="modalState.type" @change="methods.querySession"></c-select>
      </a-form-item>
      <a-form-item v-if="formState.type == '1'" label="会话" name="token">
        <c-select v-model:value="formState.token" :options="modalState.session" :fieldNames="{ label: 'token', value: 'token' }"></c-select>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios from '@/api';
import { message } from 'ant-design-vue';
import { required } from 'cyber-web-ui';
const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
  type: [
    { label: '用户', value: '0' }, // 根据userId 强制下线 auth/online/{userId}
    { label: '会话', value: '1' }, // 根据token 强制下线 auth/online/{userId}/{token}
  ],
  session: [],
});
// 表单信息
const formState = reactive({
  expId: undefined,
  type: undefined,
  token: undefined,
  userId: undefined,
  userName: undefined,
  ipaddr: undefined,
});
// 表单校验规则
const rules = reactive({
  type: required(),
  token: required(),
});
const $emit = defineEmits(['ok']);
const methods = {
  showModal(record) {
    modalState.visible = true;
    Object.keys(formState).forEach(key => {
      formState[key] = record[key] || undefined;
    });
    formState.type = '0';
    modalState.session = [];
    nextTick(() => {
      unref(formRef).clearValidate();
    });
  },
  async querySession() {
    if(formState.type == '0' || modalState.session?.length) return;
    try {
      let res = await axios.request({
        url: '/auth/online/search',
        method: 'get',
        params: {
          username: formState.userName,
          ipaddr: formState.ipaddr,
          page: '1',
          pageSize: '1000',
        }
      });
      modalState.session = res.data.data;
    } catch {
      modalState.session = [];
    }
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        const { expId, type, userId, token } = formState;
        // 封禁
        await axios.request({
          url: 'auth/exception/disable',
          method: 'delete',
          params: {
            expId: expId,
          }
        });
        // 强制下线
        let res = await axios.request({
          url: type == '0' ? `/auth/online/${userId}` : `/auth/online/${userId}/${token}`,
          method: 'delete',
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
