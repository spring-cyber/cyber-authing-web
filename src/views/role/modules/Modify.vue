<template>
  <c-modal
    ref="modalRef"
    v-model:visible="modalState.visible"
    width="600px"
    :title="modalState.title"
    :okText="modalState.okText"
    @ok="methods.onSubmit"
    @cancel="formState.productId = undefined"
  >
    <a-form
      ref="formRef"
      name="formName"
      :model="formState"
      :rules="rules"
      autocomplete="off" layout="vertical"
    >
      <a-form-item label="所属应用" name="productName">
        <a-input v-model:value="formState.productName" disabled></a-input>
      </a-form-item>
      <div class="grid grid-cols-2 gap-x-20px">
        <a-form-item label="角色名称" name="name">
          <a-input v-model:value="formState.name" :disabled="modalState.type == 'look'" placeholder="请输入角色名称..."></a-input>
        </a-form-item>
        <a-form-item label="角色编码" name="code">
          <a-input v-model:value="formState.code" :disabled="modalState.type == 'look'" placeholder="请输入角色编码..."></a-input>
        </a-form-item>
        <a-form-item label="角色状态" name="status">
          <a-radio-group v-model:value="formState.status" :options="STATUS" :disabled="modalState.type == 'look'"></a-radio-group>
        </a-form-item>
        <a-form-item label="显示顺序" name="orderNum">
          <a-input-number
            placeholder="请输入排序..."
            class="w-150px"
            :min="0"
            :max="9999"
            v-model:value="formState.orderNum"
            :disabled="modalState.type == 'look'"
          ></a-input-number>
        </a-form-item>
      </div>
      <a-form-item label="菜单权限" name="description">
        <c-menu-permission v-model:value="formState.menuIds" :productId="formState.productId" :disabled="modalState.type == 'look'"></c-menu-permission>
      </a-form-item>
      <a-form-item label="角色描述" name="description">
        <a-textarea v-model:value="formState.description" placeholder="请输入描述信息..." show-count :maxlength="120" :disabled="modalState.type == 'look'"></a-textarea>
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
  isLook: false,
  type: undefined,
  title: computed(() => modalState.isCreate ? '新建角色' : modalState.type == 'copy' ? '复制角色' : modalState.type == 'look' ? '查看角色' : '编辑角色'),
  okText: computed(() => modalState.isCreate ? '新建' : '确定'),
});
// 表单信息
const formState = reactive({
  id: undefined,
  productId: undefined,
  productName: undefined,
  name: undefined,
  code: undefined,
  type: '0',
  description: undefined,
  orderNum: 1,
  status: '1',
  menuIds: [],
  version: undefined,
});
// 表单校验规则
const rules = {
  name: required(),
  code: [required(), checkCode()],
  orderNum: required(),
  status: required(),
};
const $emit = defineEmits(['ok']);
const methods = {
  async showModal(record, type) {
    modalState.visible = true;
    modalState.isCreate = !record?.id;
    modalState.type = type;
    let detail = await queryDetail('/auth/role', record);
    Object.keys(formState).forEach(key => {
      formState[key] = detail?.[key];
    });
    if(modalState.isCreate) {
      formState.orderNum = 1;
      formState.status = '0';
      formState.type = '1';
    } else {
      formState.status += '';
      formState.productName = record.productName;
    }
    if(type == 'copy') formState.version = undefined;
    formState.menuIds = formState.menuIds || [];
    nextTick(unref(formRef).clearValidate);
  },
  onSubmit() {
    if(modalState.type == 'look') {
      modalState.visible = false;
      return;
    }
    return new Promise(async (resolve, reject) => {
      try {
        // 校验表单
        await unref(formRef).validate();
        // 请求添加/修改接口
        let res = await axios.request({
          url: '/auth/role',
          method: modalState.isCreate || modalState.type == 'copy' ? 'post' : 'put',
          data: {
            ...formState,
            id: modalState.type == 'copy' ? undefined : formState.id,
            productName: undefined,
          }
        });
        formState.productId = undefined;
        message.success(res.message);
        $emit('ok');
        resolve();
      } catch (error) {
        console.log('error', error);
        reject();
      }
    });
  },
};

defineExpose({
  showModal: methods.showModal,
});
</script>

<style lang="less" scoped>
</style>
