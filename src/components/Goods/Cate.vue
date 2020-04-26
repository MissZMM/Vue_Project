<template>
    <div>
      <!--      面包屑导航-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图-->
      <el-card>
        <el-row>
          <el-col>
            <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
          </el-col>
        </el-row>
<!--        表格-->
        <tree-table class="treeTable" :data="cateList" :columns="columns" show-index :selection-type="false" :expand-type="false" border :show-row-hover="false">
<!--          是否有效-->
          <template slot="isOk" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
            <i class="el-icon-error" v-else-if="scope.row.cat_deleted === true" style="color: red"></i>
          </template>
<!--          排序-->
          <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level == 0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level == 1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else-if="scope.row.cat_level == 2">三级</el-tag>
          </template>
<!--          操作-->
          <template slot="opt" slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editCateForm(scope.row.cat_id)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
          </template>
        </tree-table>
<!--        分页功能-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagesize" :page-sizes="[5, 10, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-card>
<!--      添加分类对话框-->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
<!--        添加分类的表单-->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
<!--            options指定数据源,props指定配置对象-->
            <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable change-on-select></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addForm">确 定</el-button>
  </span>
      </el-dialog>
<!--      编辑分类对话框-->
      <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
        <el-form :model="editCate" :rules="editCateRules" ref="editCateRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCate.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
    <el-button @click="editCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editForm">确 定</el-button>
  </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Cate',
  data: function () {
    return {
      // 查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      // 商品分类总页数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'isOk'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据
      addCateForm: {
        // 要添加的分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 添加的分类的等级：默认一级
        cat_level: 0
      },
      // 添加分类的表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      editCate: {
        // 要编辑的分类的名称
        cat_name: '',
        cat_id: 0
      },
      // 编辑分类的表单的验证规则
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    getCateList: async function () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品目录失败！')
      }
      this.cateList = res.data.result
      this.total = res.data.total
      this.$message.success('获取商品目录成功！')
    },
    // 监听pagesize改变的事件
    handleSizeChange: function (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码值改变的事件
    handleCurrentChange: function (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog: function () {
      // 先获取父级分类的数据列表，再展示出对话框
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    getParentCateList: async function () {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败！')
      }
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    // 选择项发生变化触发
    parentCateChange: function () {
      // console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加新的分类
    addForm: function () {
      // 发起与验证，验证成功则向服务器发出请求
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('分类添加失败！')
        }
        this.$message.success('分类添加成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框关闭事件，重置表单数据
    addCateDialogClosed: function () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击按钮，查询出当前分类的信息并显示修改分类对话框
    editCateForm: async function (id) {
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('分类数据查询失败！')
      }
      this.editCate = res.data
      this.editCateDialogVisible = true
    },
    // 监听编辑分类对话框的关闭事件，重置表单及相关数据
    editCateDialogClosed: function () {
      this.$refs.editCateRef.resetFields()
      this.editCate.cat_name = ''
      this.editCate.cat_id = 0
    },
    // 点击按钮，对数据进行预验证并编辑分类
    editForm: function () {
      this.$refs.editCateRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('验证不通过，请重新输入！')
        }
        const { data: res } = await this.$http.put('categories/' + this.editCate.cat_id, this.editCate)
        if (res.meta.status !== 200) {
          return this.$message.error('分类更新失败！')
        }
        this.$message.success('分类更新成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 点击按钮，根据分类ID删除分类
    removeCateById: async function (id) {
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.info('取消删除操作！')
      }
      // 发起删除分类的请求
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      this.$message.success('删除分类成功！')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
