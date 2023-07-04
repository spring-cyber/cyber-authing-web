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
      <a-form-item label="授权应用" name="productName">
        <a-input v-model:value="formState.productName" disabled></a-input>
      </a-form-item>
      <a-form-item label="授权用户" name="userIds">
        <c-user-select
          v-if="modalState.visible && formState.productId"
          v-model:value="formState.userIds"
          :mode="modalState.isCreate ? 'multiple' : ''"
          :disabled="!modalState.isCreate"
          placeholder="请选择用户"
          :isPermission="modalState.isCreate"
          :productId="formState.productId"
        >
          <template #suffixIcon v-if="!modalState.isCreate"></template>
        </c-user-select>
      </a-form-item>
      <a-form-item label="授权角色" name="roleId">
        <c-select v-model:value="formState.roleId" :options="modalState.roleList" mode="multiple" placeholder="请选择角色"></c-select>
      </a-form-item>
      <a-form-item label="授权状态" name="status">
        <a-radio-group v-model:value="formState.status" :options="STATUS" />
      </a-form-item>
      <a-form-item label="授权描述" name="description">
        <a-textarea v-model:value="formState.description" placeholder="请输入描述信息..." show-count :maxlength="120" :disabled="modalState.type == 'look'"></a-textarea>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios, { queryDetail } from '@/api';
import { message } from 'ant-design-vue';
import { required, useDict } from 'cyber-web-ui';
const { STATUS } = useDict({ COMMON: ['STATUS'] });
const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
  isCreate: true,
  title: computed(() => modalState.isCreate ? '新建授权' : '编辑授权'),
  okText: computed(() => modalState.isCreate ? '新建' : '确定'),
  roleList: [],
});
// 表单信息
const formState = reactive({
  id: undefined,
  productId: undefined,
  productName: undefined,
  userIds: undefined,
  roleId: undefined,
  description: undefined,
  status: undefined,
  version: undefined,
});
// 表单校验规则
const rules = {
  userIds: required(),
  roleId: required(),
  status: required(),
};
const $emit = defineEmits(['ok']);
const methods = {
  async showModal(record) {
    modalState.visible = true;
    modalState.isCreate = !record?.id;
    let detail = await queryDetail('/auth/userrole', record);
    Object.keys(formState).forEach(key => {
      formState[key] = detail[key];
    });
    if(modalState.isCreate) {
      formState.status = '0';
    } else {
      formState.status += '';
      formState.productName = record.productName;
      formState.userIds = [detail.userId]
    }
    formState.roleId = (formState.roleId || []).map(item => item.id);
    methods.queryRoleSelect(formState.productId);
    nextTick(unref(formRef).clearValidate);
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        let roleId = modalState.roleList.filter(item => formState.roleId.some(citem => citem == item.id)).map(item => {
          return { id: item.id, name: item.name, code: item.code, type: item.type }
        });
        // 请求添加/修改接口
        let res = await axios.request({
          url: '/auth/userrole',
          method: modalState.isCreate ? 'post' : 'put',
          data: {
            ...formState,
            productName: undefined,
            roleId: roleId,
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
  async queryRoleSelect(productId) {
    try {
      let res = await axios.request({
        url: '/auth/role/select',
        method: 'get',
        params: {
          productId: productId,
          status: '0',
        }
      });
      modalState.roleList = (res.data || []).map(item => {
        return { ...item, label: item.name, value: item.id };
      });
    } catch {};
  }
};

defineExpose({
  showModal: methods.showModal,
});
</script>

<style lang="less" scoped>
</style>
