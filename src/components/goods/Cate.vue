<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary" class="cateadd" @click="addCate">添加分类</el-button>
      <!-- 树形表格（vue依赖项） -->
      <tree-table
        :data="categoriesList"
        :columns="columnsCate"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen;font-size:20px"
          ></i>
          <i class="el-icon-error" v-else style="color:red;font-size:20px"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="showit">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        class="catepage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="categoriesInfo.pagenum"
        :page-sizes="[3,5,7,10]"
        :page-size="categoriesInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类弹出框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="dialogVisibleCate"
      width="50%"
      @close="dialogVisibleCateClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRel"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <!-- options指定数据源，props指定配置对象 -->
          <el-cascader
            v-model="selectKeys"
            :options="cateOptions"
            :props="cateProps"
            clearable
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleCate = false">取 消</el-button>
        <el-button type="primary" @click="sureCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //cwen 获取分类列表参数
      categoriesInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //cwen 数据总数
      total: 0,
      //cwen 商品分类列表
      categoriesList: [],
      columnsCate: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示把当前列定义为模板列
          type: 'template',
          // 表示当前这个模板列的名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示把当前列定义为模板列
          type: 'template',
          // 表示当前这个模板列的名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示把当前列定义为模板列
          type: 'template',
          // 表示当前这个模板列的名称
          template: 'showit'
        }
      ],
      //cwen 控制添加分类提示框
      dialogVisibleCate: false,
      //cwen 添加分类的表单数据
      addCateForm: {
        // 父分类ID
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类等级
        cat_level: 0
      },
      //cwen 表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
        ]
      },
      //cwen 级联选择框，选中的数据id
      selectKeys: [],
      //cwen 级联选择器数据源（商品父级分类）
      cateOptions: [],
      //cwen 级联选择器指定配置
      cateProps: {
        expandTrigger: 'hover',
        //@ 是否允许可以选任意选项（更新部分）
        checkStrictly: true,
        // 指定选中的为分类id
        value: 'cat_id',
        // 指定选项的内容
        label: 'cat_name',
        children: 'children'
      }
    };
  },
  created() {
    this.getCategories();
  },
  methods: {
    //cwen 获取分类数据
    async getCategories() {
      const { data: res } = await this.$http.get('categories', {
        params: this.categoriesInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败');
      }
      this.categoriesList = res.data.result;
      this.total = res.data.total;
    },
    //cwen 监听页码改变事件
    handleSizeChange(size) {
      this.categoriesInfo.pagesize = size;
      this.getCategories();
    },
    //cwen 监听选中页码
    handleCurrentChange(current) {
      this.categoriesInfo.pagenum = current;
      this.getCategories();
    },
    //cwen 监听添加分类按钮
    addCate() {
      // 点击按钮发送获取父级分类请求
      this.getCateOptions();
      this.dialogVisibleCate = true;
    },
    //cwen 获取商品的父级分类
    async getCateOptions() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败');
      }
      this.cateOptions = res.data;
    },
    //cwen 监听级联选择器值的变化
    handleChange() {
      // 判断目前是几级分类
      //cwen 如果选择数组长度大于零，就说明选择了分类
      if (this.selectKeys.length > 0) {
        // 父级分类的ID等于数组中第一个元素
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1];
        // 分类登记正好等于数组的长度
        this.addCateForm.cat_level = this.selectKeys.length;
        return;
      } else {
        // 父级分类的ID等于数组中第一个元素
        this.addCateForm.cat_pid = 0;
        // 分类等级正好等于数组的长度
        this.addCateForm.cat_level = 0;
        return;
      }
    },
    //cwen 监听对话框关闭事件
    dialogVisibleCateClosed() {
      //@ 重置表单，清空选项数组，重置父级分类ID、等级
      this.$refs.addCateFormRel.resetFields();
      this.selectKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    //cwen 监听分类提交事件
    sureCate() {
      this.$refs.addCateFormRel.validate(async result => {
        if (!result) return;
        // 验证通过，发送添加分类请求
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error('新增分类失败');
        }
        this.$message.success('添加分类成功');
        this.getCategories();
        this.dialogVisibleCate = false;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.cateadd {
  margin-bottom: 18px;
}
.catepage {
  margin-top: 18px;
}
.el-cascader {
  width: 100%;
}
</style>