<template>
    <div>
      <!--      面包屑导航-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类参数</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图-->
      <el-card>
        <el-alert title="注意：只允许为三级分类设置相关参数！" :closable="false" type="warning" show-icon>
        </el-alert>
<!--        选择商品分类区域-->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <el-cascader
              v-model="selectedKeys"
              :options="cateList"
              :props="cascaderProps"
               change-on-select
            @change="handleChange"></el-cascader>
          </el-col>
        </el-row>
<!--        tab 页签区-->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <el-table :data="manyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
<!--                  循环渲染tag标签-->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
<!--                  输入文本框-->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                  </el-input>
<!--                  添加按钮-->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isDisabled" @click="addDialogVisible = true">添加属性</el-button>
            <el-table :data="onlyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!--                  循环渲染tag标签-->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                  <!--                  输入文本框-->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!--                  添加按钮-->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>

                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
<!--      添加功能实现-->
      <el-dialog :title="'添加'+ titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
      </el-dialog>
      <!--      修改功能实现-->
      <el-dialog :title="'修改'+ titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editParams">确 定</el-button>
  </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Params',
  data: function () {
    return {
      // 商品分类列表
      cateList: [],
      selectedKeys: [],
      // 级联选择框的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 被激活的页签的名称
      activeName: 'many',
      // 静态属性的数据
      onlyTableData: [],
      // 动态参数的数据
      manyTableData: [],
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 获取所有的商品分类
    this.getCateList()
  },
  methods: {
    getCateList: async function () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('商品分类获取失败！')
      }
      this.cateList = res.data
      this.$message.success('商品分类获取成功')
    },
    // 级联选择框变化时触发
    handleChange: function () {
      this.getParamsData()
    },
    // tab页签点击事件的处理函数
    handleTabClick: function () {
      this.getParamsData()
    },
    // 获取参数列表数据
    getParamsData: async function () {
      if (this.selectedKeys.length !== 3) {
        // 选中的不是三级分类
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据所选分类的id 获取参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框的关闭事件
    addDialogClosed: function () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，进行预验证并向服务器端发起请求
    addParams: function () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    showEditDialog: async function (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('参数获取失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改对话框的关闭事件
    editDialogClosed: function () {
      this.$refs.editFormRef.resetFields()
    },
    editParams: function () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('参数更新失败！')
        }
        this.$message.success('参数更新成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    removeParams: async function (attrId) {
      const removeConfirm = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (removeConfirm !== 'confirm') {
        return this.$message.info('取消操作！')
      }
      // 发起删除请求
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.getParamsData()
      return this.$message.success('删除成功！')
    },
    // 文本框失去焦点或者按下enter触发
    handleInputConfirm: async function (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        // 隐藏文本框
        row.inputVisible = false
        return
      }
      // 如果长度不为0，则说明文本框的内容有效，需要做进一步的添加处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    saveAttrVals: async function(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败！')
      }
      this.$message.success('修改参数成功！')
    },
    // 点击按钮显示文本框
    showInput: function (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick() 当页面被重新渲染后才会执行函数，保证执行顺序
      // 因为inputVisible重置为true之后，该元素可能还未被渲染出来，若此时获得焦点，不一定能够找到该元素
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应参数
    handleClose: function (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 控制添加参数和添加属性的按钮是否需要禁用
    isDisabled: function () {
      if (this.selectedKeys.length === 3) {
        return false
      } else {
        return true
      }
    },
    cateId: function () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      } else {
        return null
      }
    },
    titleText: function () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }
  .el-tag {
    margin: 10px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>
