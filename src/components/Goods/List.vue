<template>
    <div>
      <!--      面包屑导航-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>
<!--      卡片视图-->
      <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <!--        搜索与添加区域-->
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
              <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="goAddPage">添加商品</el-button>
          </el-col>
        </el-row>
        <el-table :data="goodsList" stripe style="width: 100%" border>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="goods_name" label="商品名称" >
          </el-table-column>
          <el-table-column prop="goods_price" label="商品价格(元)" width="95px">
          </el-table-column>
          <el-table-column prop="goods_weight" label="商品重量" width="70px">
          </el-table-column>
          <el-table-column prop="add_time" label="创建时间" width="140px">
            <template slot-scope="scope">
              {{scope.row.add_time | dateFormate}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 30]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-card>
    </div>
</template>

<script>
export default {
  name: 'Goods',
  data: function () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      goodsList: [],
      // 数据条数
      total: 0,
      active: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取商品列表
    getGoodsList: async function () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('商品列表获取失败！')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(this.goodsList)
      this.$message.success('商品列表获取成功！')
    },
    // 监听pagesize改变的事件
    handleSizeChange: function (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听页码值改变的事件
    handleCurrentChange: function (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    removeGoodsById: async function (id) {
      const resultConfirm = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (resultConfirm !== 'confirm') {
        return this.$message.info('取消删除操作！')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.getGoodsList()
      return this.$message.success('删除成功！')
    },
    goAddPage: function () {
      this.$router.push('goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
  .el-steps {
    margin: 15px;
  }
</style>
