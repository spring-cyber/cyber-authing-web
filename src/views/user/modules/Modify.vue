<template>
  <c-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="600px"
    :title="modalState.title"
    :okText="modalState.okText"
    @ok="methods.onSubmit"
    @cancel="() => formState.deptIds = formState.enterpriseId = undefined"
  >
    <a-form
      ref="formRef"
      name="formName"
      :model="formState"
      :rules="rules"
      autocomplete="off" layout="vertical"
    >
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="用户名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入姓名..." show-count :maxlength="32" :disabled="!modalState.isCreate"></a-input>
        </a-form-item>
        <a-form-item label="用户性别" name="sex">
          <c-select v-model:value="formState.sex" :options="SEX" placeholder="请选择性别"></c-select>
        </a-form-item>
        <a-form-item label="账号" name="userName">
          <a-input v-model:value="formState.userName" placeholder="请输入账号..." show-count :maxlength="32" :disabled="!modalState.isCreate"></a-input>
        </a-form-item>
        <a-form-item label="密码" name="password">
          <c-input-password v-if="modalState.visible" :show-eye="modalState.isCreate" v-model:value="formState.password" placeholder="请输入密码..." :disabled="!modalState.isCreate"></c-input-password>
        </a-form-item>
        <a-form-item label="手机" name="phone">
          <a-input v-model:value="formState.phone" placeholder="请输入手机..." show-count :maxlength="32"></a-input>
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="formState.email" placeholder="请输入邮箱..." show-count :maxlength="64"></a-input>
        </a-form-item>
      </div>
      <a-form-item label="所属部门" name="deptIds">
        <c-enterprise-tree-select
          v-model:value="formState.deptIds"
          v-model:enterprise="formState.enterpriseId"
          allowClear
          multiple
          placeholder="请选择所属部门"
          @enterpriseChange="methods.enterpriseChange"
        ></c-enterprise-tree-select>
      </a-form-item>
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="岗位" name="positionIds">
          <c-position-select
            v-model:value="formState.positionIds"
            :enterpriseId="formState.enterpriseId"
            mode="multiple"
            allowClear
            placeholder="请选择岗位"
          ></c-position-select>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="formState.status" :options="USER_STATUS"></a-radio-group>
        </a-form-item>
      </div>
      <a-form-item label="用户描述" name="remark">
        <a-textarea v-model:value="formState.remark" placeholder="请输入描述信息..." show-count :maxlength="120"></a-textarea>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios, { queryDetail } from '@/api';
import { message } from 'ant-design-vue';
import { PWD_ENC_KEY, encryption, required, checkEmail, checkPassword, useDict } from 'cyber-web-ui';
const { USER_STATUS, SEX } = useDict({ COMMON: ['USER_STATUS', 'SEX'] });
const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
  isCreate: true,
  title: computed(() => modalState.isCreate ? '新建用户' : '编辑用户'),
  okText: computed(() => modalState.isCreate ? '新建' : '确定'),
});
// 表单信息
const formState = reactive({
  id: undefined,
  deptIds: undefined,
  name: undefined,
  userName: undefined,
  password: undefined,
  sex: undefined,
  email: undefined,
  phone: undefined,
  status: undefined,
  remark: undefined,
  enterpriseId: undefined,
  positionIds: undefined,
  version: undefined,
});
// 表单校验规则
const rules = reactive({
  name: required(),
  userName: required(),
  password: computed(() => [required(), modalState.isCreate ? checkPassword() : undefined].filter(item => item)),
  sex: required(),
  email: [required(), checkEmail()],
  phone: required(),
  status: required(),
});
const $emit = defineEmits(['ok']);
const methods = {
  async showModal(record) {
    modalState.visible = true;
    modalState.isCreate = !record?.id;
    let detail = await queryDetail('/auth/user', record);
    Object.keys(formState).forEach(key => {
      if(Array.isArray(detail?.[key])) {
        formState[key] = detail?.[key].map(item => item + '');
      } else {
        formState[key] = modalState.isCreate
          ? undefined
          : typeof detail?.[key] == 'number'
            ? detail?.[key] + ''
            : detail?.[key] || undefined;
      }
    });
    if(modalState.isCreate) {
      formState.status = '0';
    } else {
      if(!detail.deptIds?.length && detail.enterpriseId) {
        formState.deptIds.push(detail.enterpriseId);
      }
    }

    nextTick(unref(formRef).clearValidate);
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        let { password } = encryption({
          key: PWD_ENC_KEY,
          data: { password: formState.password },
          param: ['password'],
        });
        // 请求添加/修改接口
        let res = await axios.request({
          url: '/auth/user',
          method: modalState.isCreate ? 'post' : 'put',
          data: {
            ...formState,
            deptIds: (formState.deptIds || []).filter(item => item != formState.enterpriseId),
            password: modalState.isCreate ? password : undefined,
            userName: modalState.isCreate ? formState.userName : undefined,
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
  enterpriseChange() {
    if(!formState.enterpriseId) {
      formState.positionIds = undefined;
    }
  },
};

defineExpose({
  showModal: methods.showModal,
});
</script>

<style lang="less" scoped>
</style>
