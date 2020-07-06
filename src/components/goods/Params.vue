<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="注意：只允许第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择分类区 -->
      <el-row class="changeparams">
        <el-col>
          <span>选择产品分类：</span>
          <!-- 级联选择器，展示分类名称 -->
          <el-cascader
            v-model="selectKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab栏切换部分 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="showDialogParamsVisible">添加参数</el-button>
          <!-- 动态参数表格展示 -->
          <el-table :data="manyParams" border stripe>
            <el-table-column type="expand" label="@">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="tagClosed(scope.row,index)"
                >{{item}}</el-tag>
                <!-- 可以修改的tag -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <!-- 操作按钮 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="showDialogParamsVisible">添加属性</el-button>
          <!-- 动态参数表格展示 -->
          <el-table :data="onlyParams" border stripe>
            <el-table-column type="expand" label="@">
              <!-- 静态属性的修改（与参数修改共用一套好函数） -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="tagClosed(scope.row,index)"
                >{{item}}</el-tag>
                <!-- 可以修改的tag -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <!-- 操作按钮 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加（动态参数、静态属性） -->
    <el-dialog
      :title="'添加'+ changTitle"
      :visible.sync="dialogParamsVisible"
      width="50%"
      @close="dialogParamsVisibleClosed"
    >
      <!-- 添加表单 -->
      <el-form :model="addParamsForm" :rules="paramsRules" ref="paramsFormRef" label-width="100px">
        <el-form-item :label="changTitle" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogParamsVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParmas">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改（动态参数、静态属性） -->
    <el-dialog
      :title="'修改'+ changTitle"
      :visible.sync="dialogEditVisible"
      width="50%"
      @close="dialogEditVisibleClosed"
    >
      <!-- 修改表单 -->
      <el-form :model="editParamsForm" :rules="paramsRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="changTitle" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParmas(editParamsForm.attr_id)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //! 商品分类
      cateList: [],
      //! 选中的分类id
      selectKeys: [],
      //! 级联选择器的配置项
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //! tab栏默认选中板块
      activeName: 'many',
      //! 动态参数
      manyParams: [],
      //! 静态参数
      onlyParams: [],
      //! 添加弹出框的关闭与显示
      dialogParamsVisible: false,
      //! 修改参数甜出框的关闭显示
      dialogEditVisible: false,
      //! 添加参数的表单数据
      addParamsForm: {},
      //! 添加参数表单规则(和修改共用)
      paramsRules: {
        attr_name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }
        ]
      },
      //! 修改参数数据
      editParamsForm: {}
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //! 获取分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 3
        }
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败');
      }
      this.cateList = res.data;
    },
    //! 监听级联选择器发生改变
    handleChange() {
      //@ 官方只允许修改三级分类，所以要对选取分类做处理
      if (this.selectKeys.length !== 3) {
        this.selectKeys = [];
        //@ 清空已经渲染的页面（防止提交时出错）
        this.manyParams = [];
        this.onlyParams = [];
        return;
      }
      // console.log(this.selectKeys);
      //@ 拿到需要展示的数据
      this.getParamsList();
    },
    //! 监听点击切换的tab栏
    handleTabClick() {
      //@ 拿到需要展示的数据
      this.getParamsList();
      // console.log(this.activeName);
    },
    //! 发送请求拿到展示参数数据列表(级联选择器、tab栏按钮都要监听)
    async getParamsList() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateID}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('请求参数列表失败');
      }
      //@ 对参数进行处理，将其中的attr_vals保存为数组形式（便于展示）
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        //@ 给每条数据一个布尔值控制文本框显示与隐藏（防止联动）
        item.inputVisible = false;
        item.inputValue = '';
      });
      //@ 请求成功进行判断（是动态参数还是静态属性）
      if (this.activeName === 'many') {
        // console.log(res.data);
        this.manyParams = res.data;
      } else {
        this.onlyParams = res.data;
      }
    },
    //! 监听添加（参数、属性）
    showDialogParamsVisible() {
      this.dialogParamsVisible = true;
    },
    //! 监听弹出框关闭事件（关闭清空表单内容）
    dialogParamsVisibleClosed() {
      this.$refs.paramsFormRef.resetFields();
    },
    //! 监听添加参数按钮
    addParmas() {
      this.$refs.paramsFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateID}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败');
        }
        // 添加成功（提示、刷新参数列表、关闭弹出框）
        this.$message.success('添加成功');
        this.getParamsList();
        this.dialogParamsVisible = false;
      });
    },
    //! 监听修改参数按钮(同时发送请求显示要修改的数据)
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateID}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败');
      }
      this.editParamsForm = res.data;
      this.dialogEditVisible = true;
    },
    //! 监听修改参数甜出框关闭事件(清空内容，并解除验证)
    dialogEditVisibleClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //! 监听提交修改按钮（预验证通过对其修改）
    editParmas(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateID}/attributes/${id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败');
        }
        this.$message.success('修改成功');
        this.getParamsList();
        this.dialogEditVisible = false;
      });
    },
    //! 监听删除参数按钮
    async deleteParams(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      if (confirmResult !== 'confirm') {
        return this.$message.info('您取消了删除');
      }
      // 删除参数的业务逻辑
      const { data: res } = await this.$http.delete(
        `categories/${this.cateID}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败');
      }
      this.$message.success('删除参数成功');
      this.getParamsList();
    },
    //! 监听新增标签的点击事件以及失去焦点
    handleInputConfirm(row) {
      //@ 如果输入内容为空格，清空内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = '';
        row.inputVisible = false;
        return;
      }
      //@ 如果没有return，则需做后续处理
      // 处理提交时的参数
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = '';
      row.inputVisible = false;
      // 保存到数据库
      this.saveAttrVals(row);
    },
    //! 将对attr_id的操作保存到数据库
    async saveAttrVals(row) {
      //@ 发送请求保存此次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateID}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败');
      }
      this.$message.success('修改参数成功');
    },
    //! 监听标签的点击事件（变成input输入框）
    showInput(row) {
      row.inputVisible = true;
      //! $nextTick方法的作用，当页面上的元素被重新渲染了之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //! 监听参数的删除事件
    tagClosed(row, index) {
      // 拿到索引删除此项
      row.attr_vals.splice(index, 1);
      // 保存到数据库
      this.saveAttrVals(row);
    }
  },
  computed: {
    //! 判断按钮是否要被禁用
    isBtnDisabled() {
      if (this.selectKeys.length !== 3) {
        return true;
      }
      return false;
    },
    //! 拿到第三级分类的id
    cateID() {
      if (this.selectKeys.length === 3) {
        // 如果选中三级分类，输出数组第三个（三级分类的ID）
        return this.selectKeys[2];
      } else {
        return null;
      }
    },
    changTitle() {
      if (this.activeName === 'many') {
        return '动态参数';
      } else {
        return '静态属性';
      }
    }
  }
};
</script>

<style lang="less" scoped>
.changeparams {
  margin: 15px 0;
}
.el-tag {
  margin: 8px;
}
.input-new-tag {
  width: 100px;
}
</style>