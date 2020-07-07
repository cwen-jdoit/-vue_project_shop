<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 消息提示框 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 含状态的步骤条 -->
      <el-steps :active="currentActive - '0'" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- form表单 -->
      <el-form
        :model="goodsParamsInfo"
        :rules="goodsRules"
        ref="goodsFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- Tab栏 -->
        <el-tabs
          tab-position="left"
          v-model="currentActive"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodsParamsInfo.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="goodsParamsInfo.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="goodsParamsInfo.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="goodsParamsInfo.goods_number"></el-input>
            </el-form-item>
            <!-- 级联选择器选择商品分类 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="goodsParamsInfo.goods_cat"
                :options="goodsCate"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="(item,index) in manyInfo" :key="index" :label="item.attr_name">
              <!-- 复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb,i) in item.attr_vals" :label="cb" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="(item,index) in onlyInfo" :key="index" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headerObj"
              list-type="picture"
              :on-success="uploadPic"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">上传一张商品描述图片吧</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="goodsParamsInfo.goods_introduce" />
            <!-- 添加按钮 -->
            <el-button type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片展示对话框 -->
    <el-dialog title="图片展示" :visible.sync="dialogPicVisible" width="50%">
      <span>
        <img :src="myPic" alt style="width:100%" />
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
export default {
  data() {
    return {
      //# 商品分类列表
      goodsCate: [],
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //# 定义控制状态步骤条以及tab栏的变量(tab要求值字符串)
      currentActive: '0',
      //# 表单需要提交的商品数据
      goodsParamsInfo: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属分类数组
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        // 商品参数
        attrs: []
      },
      //# 图片上传时，给请求头加token
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //# 表单数据验证规则
      goodsRules: {
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
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      },
      //# 商品参数列表
      manyInfo: [],
      //# 商品静态参数列表
      onlyInfo: [],
      //# 图片展示弹出框
      dialogPicVisible: false,
      //# 图片路径
      myPic: ''
    };
  },
  created() {
    //# 获取商品分类数据
    this.getGoodsCate();
  },
  methods: {
    //# 获取商品分类数据
    async getGoodsCate() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 3
        }
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败');
      }
      this.goodsCate = res.data;
    },
    //# 监听级联选择器的改变事件
    handleChange() {
      // 默认只能选择三级分类（如果不是三级，就清空选择器）
      if (this.goodsParamsInfo.goods_cat.length !== 3) {
        this.goodsParamsInfo.goods_cat = [];
      }
    },
    //# 监听切换标签页的条件
    beforeTabLeave(activeName, oldActiveName) {
      if (
        oldActiveName === '0' &&
        this.goodsParamsInfo.goods_cat.length !== 3
      ) {
        this.$message.error('请选择商品分类');
        return false;
      }
    },
    //# 监听tab栏的切换事件
    async tabClick() {
      //# 如果切换到参数面板，发送请求获取参数
      if (this.currentActive === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        );
        // 对参数进行加工，转换成字符串
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        });
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数数据失败');
        }
        this.manyInfo = res.data;
      } else if (this.currentActive === '2') {
        // 切换到属性面板，发送属性请求
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        );
        // console.log(res.data)
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态参数失败');
        }
        this.onlyInfo = res.data;
      }
    },
    //# 监听图片上传按钮
    uploadPic(response) {
      // console.log(response)
      const uplodPic = { pic: response.data.tmp_path };
      this.goodsParamsInfo.pics.push(uplodPic);
    },
    //# 上传后的文件展示
    handlePreview(file) {
      this.dialogPicVisible = true;
      this.myPic = file.response.data.url;
    },
    //# 删除上传照片
    handleRemove(file) {
      // 拿到要删除的图片的路径，在数组中查找，然后删除
      const picPath = file.response.data.tmp_path;
      const index = this.goodsParamsInfo.pics.findIndex(item => {
        item.pic === picPath;
      });
      this.goodsParamsInfo.pics.splice(index, 1);
    },
    //# 监听添加商品按钮
    addGood() {
      this.$refs.goodsFormRef.validate(async valida => {
        if (!valida) {
          return this.$message.error('请填写必要项');
        }
        //@ 此处进行深拷贝后处理post参数(防止双向绑定数据出错)
        const form = _.cloneDeep(this.goodsParamsInfo);
        form.goods_cat = form.goods_cat.join(',');
        // 处理attrs参数
        this.manyInfo.forEach(item => {
          const newInfor = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          };
          this.goodsParamsInfo.attrs.push(newInfor);
        });
        this.onlyInfo.forEach(item => {
          const newInfor = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.goodsParamsInfo.attrs.push(newInfor);
        });
        form.attrs = this.goodsParamsInfo.attrs;
        // 参数处理完成，开始添加请求
        const { data: res } = await this.$http.post('goods', form);
        if (res.meta.status !== 201) {
          return this.$message.error('商品创建失败');
        }
        this.$message.success('商品创建成功');
        this.$router.push('/goods');
      });
    }
  },
  computed: {
    cateId() {
      if (this.goodsParamsInfo.goods_cat.length === 3) {
        return this.goodsParamsInfo.goods_cat[2];
      } else {
        return null;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.el-steps {
  margin: 18px 0;
}
.el-checkbox {
  margin: 0 6px 0 0 !important;
}
.el-button {
  margin-top: 6px;
}
</style>