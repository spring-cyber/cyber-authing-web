import User from '@/views/system/user/index.vue';
import Tenant from '@/views/system/tenant/index.vue';
import Project from '@/views/system/project/index.vue';
import Account from '@/views/system/account/index.vue';
import ActivityLog from '@/views/system/activity-log/index.vue';
import Dept from '@/views/system/dept/index.vue';
import Position from '@/views/system/position/index.vue';
import Product from '@/views/system/product/index.vue';
import Role from '@/views/system/role/index.vue';
import Permission from '@/views/system/permission/index.vue';

export default [
  {
    path: '/user-center',
    redirect: '/user-center-overview',
    meta: {
      title: '用户中心',
      icon: 'icon-gailan-2',
      hideNav: true,
    },
    children: [
      {
        path: '/organization-manage',
        redirect: '/user-center-overview',
        meta: {
          title: '组织管理',
        },
        children: [
          {
            path: '/dept',
            name: 'Dept',
            component: Dept,
            meta: {
              title: '部门管理',
            },
          },
          {
            path: '/position',
            name: 'Position',
            component: Position,
            meta: {
              title: '岗位管理',
            },
          },
          {
            path: '/user',
            name: 'User',
            component: User,
            meta: {
              title: '用户管理',
            },
          },
          // {
          //   path: '/account',
          //   name: 'Account',
          //   component: Account,
          //   meta: {
          //     title: '账号',
          //   },
          // },
        ]
      },
      {
        path: '/resource-manage',
        meta: {
          title: '资源管理',
        },
        children: [
          {
            path: '/tenant',
            name: 'Tenant',
            component: Tenant,
            meta: {
              title: '租户管理',
            },
          },
          {
            path: '/project',
            name: 'Project',
            component: Project,
            meta: {
              title: '项目管理',
            },
          },
          {
            path: '/product',
            name: 'Product',
            component: Product,
            meta: {
              title: '产品管理',
            },
          },
        ]
      },
      {
        path: '/application-manage',
        meta: {
          title: '应用管理',
        },
      },
      {
        path: '/permission-manage',
        meta: {
          title: '权限管理',
        },
        children: [
          {
            path: '/role',
            name: 'Role',
            component: Role,
            meta: {
              title: '角色管理',
            },
          },
          {
            path: '/permission',
            name: 'Permission',
            component: Permission,
            meta: {
              title: '授权管理',
            },
          },
        ]
      },
      {
        path: '/resource-manage',
        meta: {
          title: '安全管理',
        },
        children: [
          {
            path: '/activity-log',
            name: 'ActivityLog',
            component: ActivityLog,
            meta: {
              title: '审计日志',
            },
          },
        ]
      },
    ]
  },
]