<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="orderParamsInfo.query">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单信息展示的表格 -->
      <el-table :data="orderInfor" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间"></el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showOrderEdit"></el-button>
            <el-button type="success" size="mini" icon="el-icon-location-outline" @click="showLog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页视图 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orderParamsInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="orderParamsInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改地址按钮弹出框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="dialogOrderVisible"
      width="50%"
      @close="dialogOrderVisibleClose"
    >
      <span>
        <!-- 表单 -->
        <el-form :model="orderForm" :rules="orderFormRules" ref="orderFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="adress1">
            <!-- 级联选择器 -->
            <el-cascader
              v-model="orderForm.adress1"
              :options="citydata"
              :props="{ expandTrigger: 'hover' }"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="adress2">
            <el-input v-model="orderForm.adress2"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogOrderVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogOrderVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息弹出框 -->
    <el-dialog title="物流信息" :visible.sync="dialogLogVisible" width="50%">
      <span>
        <el-timeline v-for="(item,index) in logInfo" :key="index">
          <el-timeline-item :timestamp="item.time" placement="top">
            <el-card>
              <h4>物流更新节点</h4>
              <p>{{item.context}}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </span>
    </el-dialog>
  </div>
</template>

<script>
//# 导入省市区三级联动文件（数据）
import citydata from '../../assets/js/citydata.js';
export default {
  data() {
    return {
      //# 获取订单请求参数
      orderParamsInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //# 数据条数
      total: 0,
      //# 订单信息
      orderInfor: [],
      //# 控制修改地址显示隐藏
      dialogOrderVisible: false,
      orderForm: {
        adress1: [],
        adress2: ''
      },
      orderFormRules: {
        adress1: [
          { required: true, message: '请选择收货地址', trigger: 'blur' }
        ],
        adress2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      //# 三级联动数据
      citydata: citydata,
      //# 控制物流信息显示隐藏
      dialogLogVisible: false,
      //# 物流信息
      logInfo: []
    };
  },
  created() {
    //# 获取订单信息
    this.getOrderInfo();
  },
  methods: {
    //# 获取订单信息
    async getOrderInfo() {
      const { data: res } = await this.$http.get('orders', {
        params: this.orderParamsInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单信息失败');
      }
      this.total = res.data.total;
      this.orderInfor = res.data.goods;
    },
    //# 监听分页选择(页数)
    handleSizeChange(newSize) {
      this.orderParamsInfo.pagesize = newSize;
      this.getOrderInfo();
    },
    //# 监听当前页码
    handleCurrentChange(newNum) {
      this.orderParamsInfo.pagenum = newNum;
      this.getOrderInfo();
    },
    //# 点击修改按钮，显示修改弹出框
    showOrderEdit() {
      this.dialogOrderVisible = true;
    },
    //# 监听关闭弹框事件（重置表单+移除验证）
    dialogOrderVisibleClose() {
      this.$refs.orderFormRef.resetFields();
    },
    //# 查看物流信息
    showLog() {
      // 查询物流信息并展示 (接口有误，用假数据模拟)
      const res = {
        data: [
          {
            time: '2018-05-10 09:39:00',
            ftime: '2018-05-10 09:39:00',
            context: '已签收,感谢使用顺丰,期待再次为您服务',
            location: ''
          },
          {
            time: '2018-05-10 08:23:00',
            ftime: '2018-05-10 08:23:00',
            context:
              '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
            location: ''
          },
          {
            time: '2018-05-10 07:32:00',
            ftime: '2018-05-10 07:32:00',
            context: '快件到达 [北京海淀育新小区营业点]',
            location: ''
          },
          {
            time: '2018-05-10 02:03:00',
            ftime: '2018-05-10 02:03:00',
            context:
              '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
            location: ''
          },
          {
            time: '2018-05-09 23:05:00',
            ftime: '2018-05-09 23:05:00',
            context: '快件到达 [北京顺义集散中心]',
            location: ''
          },
          {
            time: '2018-05-09 21:21:00',
            ftime: '2018-05-09 21:21:00',
            context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
            location: ''
          },
          {
            time: '2018-05-09 13:07:00',
            ftime: '2018-05-09 13:07:00',
            context: '顺丰速运 已收取快件',
            location: ''
          },
          {
            time: '2018-05-09 12:25:03',
            ftime: '2018-05-09 12:25:03',
            context: '卖家发货',
            location: ''
          },
          {
            time: '2018-05-09 12:22:24',
            ftime: '2018-05-09 12:22:24',
            context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
            location: ''
          },
          {
            time: '2018-05-08 21:36:04',
            ftime: '2018-05-08 21:36:04',
            context: '商品已经下单',
            location: ''
          }
        ],
        meta: { status: 200, message: '获取物流信息成功！' }
      };
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败');
      }
      this.logInfo = res.data;
      this.dialogLogVisible = true;
    }
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>