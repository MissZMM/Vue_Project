<template>
  <div>
    <!--      面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    卡片视图-->
    <el-card>
<!--      添加角色按钮区-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
<!--      角色列表-->
      <el-table :data="rolesList" stripe style="width: 100%" border>
<!--        展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bdbottom', i1==0 ? 'bdtop' : '', 'vcenter']">
<!--              一级权限的渲染-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
<!--              二级权限和三级权限额渲染-->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 == 0 ? '' : 'bdtop', 'vcenter']">
                  <!--                二级权限渲染-->
                  <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--                三级权限渲染-->
                  <el-col :span="18">
                    <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!--              修改按钮-->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editDialogShow(scope.row.id)">编辑</el-button>
            <!--              删除按钮-->
            <el-button size="mini" type="warning" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
            <!--              分配角色按钮-->
            <el-button size="mini" type="danger" icon="el-icon-s-tools" @click="showsetRightDialog(scope.row)">分配权限</el-button>

          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="权限分配" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed" >
      <el-tree :data="rightList" show-checkbox :props="treeProps" node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
<!--    添加角色对话框-->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClosed">
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRoleDialog">确 定</el-button>
  </span>
    </el-dialog>
<!--    编辑角色对话框-->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editRoleRules" ref="editRoleRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data: function () {
    return {
      rolesList: [],
      setRightDialogVisible: false,
      rightList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点数组
      defKeys: [],
      // 当前即将分配权限的角色Id
      roleId: '',
      // 关闭角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ]
      },
      editRoleDialogVisible: false,
      editForm: {},
      editRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    getRolesList: async function () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    removeRightById: async function (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作！')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('权限删除失败！')
      }
      // 不建议刷新整个列表，会导致页面重刷新
      // this.getRolesList()
      // data返回的是删除后剩下的数据
      role.children = res.data
      this.$message.success('权限删除成功！')
    },
    // 展开分配权限对话框
    showsetRightDialog: async function (role) {
      // 保存当前选中角色的ID值，留待提交分配角色请求时使用
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      this.rightList = res.data
      // console.log(this.rightList)
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式获取三级权限的id
    getLeafKeys: function (node, arr) {
      // 当前节点不包含children属性，则为三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed: function () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    allotRights: async function () {
      // 通过树结构引用拿到所有全选和半选状态下的key
      const keys = [...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()]
      // 将keys以文档要求的字符串形式保存
      const idStr = keys.join(',')
      // 提交请求，为角色分配权限
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功')
      // 刷新当前页面
      this.getRolesList()
      // 分配完角色，关闭窗口
      this.setRightDialogVisible = false
    },
    // 添加角色对话框
    addRoleDialog: async function () {
      this.$refs.addRoleRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // 发起添加用户的网络请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('角色添加失败！')
        this.$message.success('角色添加成功！')
        // 刷新用户列表
        this.getRolesList()
        // 关闭添加用户对话框
        this.addRoleDialogVisible = false
      })
    },
    addRoleDialogClosed: function () {
      this.$refs.addRoleRef.resetFields()
    },
    // 删除角色
    removeRoleById: async function (id) {
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') return this.$message.info('取消删除操作！')
      // 发起删除用户请求
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('角色删除失败')
      this.$message.success('角色已永久删除！')
      this.getRolesList()
    },
    // 控制修改用户对话框的显示与隐藏
    editDialogShow: async function (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取用户数据失败！')
      this.editForm = res.data
      this.editRoleDialogVisible = true
    },
    editDialogClosed: function () {
      this.$refs.editRoleRef.resetFields()
    },
    editRoleInfo: function () {
      this.$refs.editRoleRef.validate(async valide => {
        if (!valide) return
        // 发起修改用户的请求
        const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('角色修改失败！')
        this.editRoleDialogVisible = false
        // 刷新数据列表
        this.getRolesList()
        this.$message.success('角色修改成功！')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
