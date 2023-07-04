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
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="所属企业" name="enterpriseId">
          <c-enterprise-select v-model:value="formState.enterpriseId" placeholder="请选择企业"></c-enterprise-select>
        </a-form-item>
        <a-form-item label="上级部门" name="parentId">
          <c-dept-tree-select
            v-model:value="formState.parentId"
            placeholder="请选择部门"
            allowClear
            :enterpriseId="formState.enterpriseId"
            :excludeId="modalState.isCreate ? undefined : formState.id"
          ></c-dept-tree-select>
        </a-form-item>
      </div>
      <a-form-item label="部门名称" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入部门名称..." show-count :maxlength="64"></a-input>
      </a-form-item>
      <a-form-item label="部门编码" name="code">
        <a-input v-model:value="formState.code" placeholder="请输入部门编码..." show-count :maxlength="32"></a-input>
      </a-form-item>
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="部门状态" name="status">
          <a-radio-group v-model:value="formState.status" :options="STATUS"></a-radio-group>
        </a-form-item>
        <a-form-item label="显示顺序" name="orderNum">
          <a-input-number
            placeholder="请输入排序..."
            class="w-150px"
            :min="0"
            :max="9999"
            v-model:value="formState.orderNum"
          ></a-input-number>
        </a-form-item>
        <a-form-item label="负责人" name="leader">
          <a-input v-model:value="formState.leader" placeholder="请输入负责人姓名..." show-count :maxlength="32"></a-input>
        </a-form-item>
        <a-form-item label="联系电话" name="phone">
          <a-input v-model:value="formState.phone" placeholder="请输入负责人电话..." show-count :maxlength="32"></a-input>
        </a-form-item>
        <a-form-item label="联系邮箱" name="email">
          <a-input v-model:value="formState.email" placeholder="请输入负责人联系邮箱..." show-count :maxlength="64"></a-input>
        </a-form-item>
      </div>
      <a-form-item label="企业描述" name="description">
        <a-textarea v-model:value="formState.description" placeholder="请输入描述信息..." show-count :maxlength="120"></a-textarea>
      </a-form-item>
    </a-form>
  </c-modal>
</template>

<script setup>
import axios, { queryDetail } from '@/api';
import { message } from 'ant-design-vue';
import { required, useDict, checkCode } from 'cyber-web-ui';
const { STATUS } = useDict({ COMMON: ['STATUS'] });
const formRef = ref(); // 表单ref
// 弹窗信息
const modalState = reactive({
  visible: false,
  isCreate: true,
  title: computed(() => modalState.isCreate ? '新建部门' : '编辑部门'),
  okText: computed(() => modalState.isCreate ? '新建' : '确定'),
});
// 表单信息
const formState = reactive({
  id: undefined,
  parentId: undefined,
  enterpriseId: undefined,
  name: undefined,
  code: undefined,
  leader: undefined,
  phone: undefined,
  email: undefined,
  orderNum: 1,
  description: undefined,
  status: '0',
  version: undefined,
});
// 表单校验规则
const rules = {
  enterpriseId: required(),
  name: required(),
  code: [required(), checkCode()],
  orderNum: required(),
  status: required(),
};
const $emit = defineEmits(['ok']);
const methods = {
  async showModal(record) {
    modalState.visible = true;
    modalState.isCreate = !record?.id;
    let detail = await queryDetail('/auth/dept', record);
    Object.keys(formState).forEach(key => {
      formState[key] = detail?.[key];
    });
    if(modalState.isCreate) {
      formState.orderNum = 1;
      formState.status = '0';
    } else {
      formState.status += '';
      formState.parentId = formState.parentId == '0' ? undefined : formState.parentId;
    }
    nextTick(unref(formRef).clearValidate);
  },
  onSubmit() {
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        // 请求添加/修改接口
        let res = await axios.request({
          url: '/auth/dept',
          method: modalState.isCreate ? 'post' : 'put',
          data: formState
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
