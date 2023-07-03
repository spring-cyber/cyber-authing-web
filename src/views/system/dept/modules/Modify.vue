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
            <a-form-item label="部门id" name="id">
          <a-input v-model:value="formState.id" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="父部门id" name="parentId">
          <a-input v-model:value="formState.parentId" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="部门编码" name="code">
          <a-input v-model:value="formState.code" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="部门名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="负责人ID" name="leaderId">
          <a-input v-model:value="formState.leaderId" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="联系电话" name="phone">
          <a-input v-model:value="formState.phone" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formState.email" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="租户编码" name="tenantCode">
          <a-input v-model:value="formState.tenantCode" placeholder="请输入"></a-input>
        </a-form-item>
        <a-form-item label="部门描述" name="description">
          <a-input v-model:value="formState.description" placeholder="请输入"></a-input>
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
  parentId: undefined,
  code: undefined,
  name: undefined,
  leaderId: undefined,
  phone: undefined,
  email: undefined,
  tenantCode: undefined,
  description: undefined,
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
          url: '/dept',
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
