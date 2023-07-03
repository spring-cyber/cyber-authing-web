<template>
  <g-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="976px"
    :icon="modalState.icon"
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
      <div class="grid grid-cols-2 gap-x-20px">
            <a-form-item label="账号ID" name="id">
          <a-input v-model:value="formState.id" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="用户ID" name="userId">
          <a-input v-model:value="formState.userId" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="登录账号" name="account">
          <a-input v-model:value="formState.account" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="密码，系统登录必选，第三方登录可空" name="password">
          <a-input v-model:value="formState.password" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="账号类型 0 系统账号 1 微信 " name="type">
          <a-input v-model:value="formState.type" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="状态（0正常 1停用）" name="status">
          <a-input v-model:value="formState.status" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="删除标志（0正常 1删除）" name="deleted">
          <a-input v-model:value="formState.deleted" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="创建者" name="creator">
          <a-input v-model:value="formState.creator" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="创建时间" name="createTime">
          <a-input v-model:value="formState.createTime" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="更新者" name="updator">
          <a-input v-model:value="formState.updator" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="更新时间" name="updateTime">
          <a-input v-model:value="formState.updateTime" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-input v-model:value="formState.remark" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="版本" name="version">
          <a-input v-model:value="formState.version" placeholder="请输入"></a-input>
        </a-form-item>
      </div>
    </a-form>
  </g-modal>
</template>

<script setup>
import axios from '@/api';
import {message} from 'ant-design-vue';

const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
  isCreate: true,
  icon: computed(() => modalState.isCreate ? 'icon-xinjian' : 'icon-bianji'),
  title: computed(() => modalState.isCreate ? '创建' : '编辑'),
  okText: computed(() => modalState.isCreate ? '创建' : '编辑'),
});
// 表单信息
const formState = reactive({
  id: undefined,
  userId: undefined,
  account: undefined,
  password: undefined,
  type: undefined,
  status: undefined,
  deleted: undefined,
  creator: undefined,
  createTime: undefined,
  updator: undefined,
  updateTime: undefined,
  remark: undefined,
  version: undefined,
});
// 表单校验规则
const rules = {};
const $emit = defineEmits(['ok']);
const methods = {
  showModal(record) {
    modalState.visible = true;
    modalState.isCreate = !record;
    Object.keys(formState).forEach(key => {
      formState[key] = modalState.isCreate ? undefined : record?.[key];
    });
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        // 请求添加/修改接口
        let res = await axios.request({
          url: '/account',
          method: modalState.isCreate ? 'post' : 'put',
          data: formState
        });
        message.success(res.message);
        modalState.visible = false;
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
