<template>
    <div>
      <!--      面包屑导航-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图-->
      <el-card>
        <el-alert title="添加商品信息" type="info" :closable="false" show-icon center>
        </el-alert>
<!--        进度条-->
        <el-steps :active="activeIndex - 0" finish-status="success" :space="200" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
<!--        tab标签-->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRulesRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" :key="i" v-for="(cb, i) in item.attr_vals" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-preview="handlePreview" :headers="headerObj" :on-remove="handleRemove" list-type="picture" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
<!--            富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
<!--            添加商品按钮-->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
        </el-form>
      </el-card>
<!--      图片预览对话框-->
      <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
        <img :src="previewImg" alt="" class="previewImg">
      </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'Add',
  data: function () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 图片路径的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cate: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的header请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewImg: '',
      previewDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    getCateList: async function () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择器变化触发
    handleChange: function () {
      if (this.addForm.goods_cat.length !== 3) {
        // 没有选中三级分类
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave: function (activeName, oldActiveName) {
      // console.log('即将进入的标签页' + activeName)
      // console.log('即将离开的标签页' + oldActiveName)
      // 禁止跳转
      // return false;
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    tabClicked: async function () {
      // console.log(this.activeIndex)
      // 此时访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('动态参数获取失败！')
        }
        // console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 访问的是静态属性面板
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('静态属性获取失败！')
        }
        // console.log(res.data)
        // res.data.forEach(item => {
        //   item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        // })
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 处理图片预览效果
    handlePreview: function(file) {
      console.log(file)
      this.previewImg = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理图片删除
    handleRemove: function (file) {
      console.log(file)
      // 1.获取将要删除的图片的路径
      const filePath = file.response.data.tmp_path
      // 2. 从pics数组中，找到这个图片的索引
      const i = this.addForm.pics.findIndex(x =>
        x.pic === filePath
      )
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess: function (response) {
      console.log(response)
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2. 将图片信息对象push到pics中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    add: function () {
      this.$refs.addFormRulesRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 执行添加的业务逻辑
        // lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // console.log(form)
        // 发起请求添加商品
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('商品添加失败！')
        }
        this.$message.success('商品添加成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId: function () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 5px 0 0!important;
  }
  .previewImg {
    width: 100%;
  }
  .btnAdd {
    margin-top: 15px;
  }
</style>
