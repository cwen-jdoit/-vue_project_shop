<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索框+添加商品按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="paramsInfo.query" clearable @clear="clearSearch">
            <el-button slot="append" icon="el-icon-search" @click="searchQuery"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表信息展示 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="120px"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量" width="120px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="120px"></el-table-column>
        <el-table-column label="创建时间" width="170px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteGood(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="paramsInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="paramsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //! 发送列表请求的参数（也用于搜索框联动）
      paramsInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      //! 列表数据
      goodsList: []
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //cwen 获取商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.paramsInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error('列表数据获取失败');
      }
      this.$message.success('列表数据获取完成');
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    //cwen 监听页码改变事件(分页)
    handleSizeChange(newSize) {
      this.paramsInfo.pagesize = newSize;
      this.getGoodsList();
    },
    //cwen 监听当前页改变事件(分页)
    handleCurrentChange(newCount) {
      this.paramsInfo.pagenum = newCount;
      this.getGoodsList();
    },
    //cwen 监听搜索按钮的点击事件
    searchQuery() {
      this.getGoodsList();
    },
    //cwen 监听清空搜索框事件
    clearSearch() {
      this.getGoodsList();
    },
    //cwen 监听删除商品事件
    async deleteGood(id) {
      const valiteConfirm = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err=>err);

      if(valiteConfirm !== 'confirm'){
       return this.$message.info('取消了删除')
      }
      const {data:res} = await this.$http.delete('goods/'+ id);
      if(res.meta.status !== 200){
       return this.$message.error('商品删除失败')
      }
      this.$message.success('商品删除成功');
      this.getGoodsList();
    },
    //cwen 监听添加商品按钮（跳转至添加页面）
    goAddGoods(){
      this.$router.push('/goods/add')
    }
  }
};
</script>

<style lang="less" scoped>
</style>