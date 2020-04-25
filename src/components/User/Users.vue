<template>
    <div>
<!--      面包屑导航-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图区域-->
      <el-card>
        <el-row :gutter="20">
          <el-col :span="7">
            <!--        搜索与添加区域-->
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
<!--        用户列表区域-->
        <el-table :data="userList" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="姓名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <el-table-column label="状态">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state"  @change="userStateChanged(scope.row)">
              </el-switch>
            </template>delete
          </el-table-column>
          <el-table-column label="操作"  width="180px">
            <template slot-scope="scope">
<!--              修改按钮-->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialogShow(scope.row.id)"></el-button>
<!--              删除按钮-->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
<!--              分配角色按钮-->
              <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
<!--        分页区域-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-card>
<!--      添加用户信息对话框-->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
<!--        内容主体与区域-->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
<!--        底部区域-->
        <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
      </el-dialog>
<!--      添加修改用户对话框-->
      <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
      </el-dialog>
<!--      添加分配角色对话框-->
      <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
        <div>
          <p>当前的用户：{{userInfo.username}}</p>
          <p>当前的角色：{{userInfo.role_name}}</p>
          <p>分配新角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Users',
  data: function () {
    // 验证邮箱
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-z\d]+(\.[a-z\d]+)*@([\da-z](-[\da-z])?)+(\.{1,2}[a-z]+)+$/
      if (regEmail.test(value)) return callback()
      callback(new Error('请输入正确的邮箱！'))
    }
    // 验证手机号
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1(3|4|5|6|7|8|9)\d{9}$/
      if (regMobile.test(value)) return callback()
      callback(new Error('请输入正确的手机号！'))
    }
    return {
      // 获取用户列表参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示条数
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户信息的显示与隐藏
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制添加用户信息的显示与隐藏
      editDialogVisible: false,
      editForm: {},
      // 修改用户的验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    getUserList: async function () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('用户数据获取失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange: function (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange: function (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    userStateChanged: async function (userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败！')
      }
      return this.$message.success('修改用户状态成功')
    },
    addDialogClosed: function () {
      this.$refs.addFormRef.resetFields()
    },
    addUser: function () {
      this.$refs.addFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        // 发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('用户添加失败！')
        this.$message.success('用户添加成功！')
        // 关闭添加用户对话框
        this.addDialogVisible = false
        // 刷新用户列表
        this.getUserList()
      })
    },
    // 控制修改用户对话框的显示与隐藏
    editDialogShow: async function (id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取用户数据失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed: function () {
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo: function () {
      this.$refs.editFormRef.validate(async valide => {
        if (!valide) return
        // 发起修改用户的请求
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) return this.$message.error('用户修改失败！')
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        this.$message.success('用户修改成功！')
      })
    },
    removeUserById: async function (id) {
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') return this.$message.info('取消删除操作！')
      // 发起删除用户请求
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('用户删除失败')
      this.$message.success('用户已永久删除！')
      this.getUserList()
    },
    setRole: async function (userInfo) {
      this.userInfo = userInfo
      // 在展示对话框之前，发起展示所有角色的请求
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表获取失败！')
      }
      this.rolesList = res.data
      console.log(res.data)
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    saveRoleInfo: async function () {
      if (!this.selectedRoleId) {
        return this.$message.error('为用户分配角色！')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败！')
      }
      this.$message.success('角色分配成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听关闭分配角色对话框事件
    setRoleDialogClosed: function () {
      this.userInfo = {}
      this.selectedRoleId = ''
    }
  }
}
</script>

<style lang="less" scoped>

</style>
