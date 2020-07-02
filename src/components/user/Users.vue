<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索框，按钮（栅格布局，24格） -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="usersInfo.query" clearable @clear="getUsersInfo">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="showDialog">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户信息动态展示的表格 -->
      <el-table :data="usersList" style="width: 100%" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialogVisible(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="changeRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页列表 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="usersInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="2"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户弹出框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="dialogVisibleClosed">
      <!-- 添加用户表单 -->
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户弹出框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editFormRefClosed"
    >
      <!-- 修改用户表单 -->
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色弹出框 -->
    <el-dialog
      title="角色分配"
      :visible.sync="dialogVisibleRole"
      width="50%"
      @close="dialogVisibleRoleClosed"
    >
      <span>
        <p>当前用户：{{thisUser.username}}</p>
        <p>当前角色：{{thisUser.role_name}}</p>
        <p>
          分配角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    //@ 获取用户信息（页面加载就获取）
    this.getUsersInfo();
  },
  data() {
    //@ 自定义效验规则(邮箱+手机号)
    const validatorEmail = (rule, value, callback) => {
      const regEmail = /^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/;
      if (regEmail.test(value)) {
        return callback();
      }
      return callback(new Error('请输入合法的邮箱'));
    };
    const validatorMobile = (rule, value, callback) => {
      const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      return callback(new Error('请输入合法的手机号'));
    };
    return {
      //@ 最好在自己的data()中添加传递的数据
      usersInfo: {
        query: '',
        //@ 当前页数
        pagenum: 1,
        //@ 当前页显示多少条数据
        pagesize: 2
      },
      //@ 将拿到的用户数据，赋值给userList
      usersList: [],
      //@ 页码
      total: 0,
      //@ 添加用户对话框展示隐藏boolean
      dialogVisible: false,
      //@ 修改用户对话框展示隐藏boolean
      editDialogVisible: false,
      //@ 分配角色对话框展示隐藏boolean
      dialogVisibleRole: false,
      //@ 添加用户表单信息
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //@ 表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ],
        email: [{ validator: validatorEmail, trigger: 'blur' }],
        mobile: [{ validator: validatorMobile, trigger: 'blur' }]
      },
      //@ 修改用户表单信息
      editForm: {},
      //@ 获取分配角色用户的信息
      thisUser: {},
      //@ 角色列表
      roleList: [],
      //@ 已经选中的角色id值（与option的value值相等）
      selectRoleId: ''
    };
  },
  methods: {
    //@ 获取用户数据列表
    async getUsersInfo() {
      const { data: res } = await this.$http.get('users', {
        params: this.usersInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败！');
      }
      this.usersList = res.data.users;
      this.total = res.data.total;
      // console.log(res);
    },
    //@ 监听每页数据变化
    handleSizeChange(size) {
      // 把此处的size赋值给请求时的pagesize，实时监听
      this.usersInfo.pagesize = size;
      this.getUsersInfo();
    },
    //@ 监听这是第几页
    handleCurrentChange(current) {
      this.usersInfo.pagenum = current;
      this.getUsersInfo();
    },
    //@ 监听用户状态变化
    async userStateChange(userinfo) {
      // 发送请求修改状态
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        // 请求失败，立即取反
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error('用户状态更新失败！');
      }
      this.$message.success('用户状态更新成功！');
      this.getUsersInfo();
    },
    //@ 监听搜索框按钮(点击发送关键字请求)
    getUserList() {
      this.getUsersInfo();
    },
    //@ 监听添加用户按钮
    showDialog() {
      this.dialogVisible = true;
    },
    //@ 监听添加用户弹出框关闭事件(关闭重置数据)
    dialogVisibleClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //@ 监听修改用户弹出框关闭事件(关闭重置数据)
    editFormRefClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //@ 进行表单预验证（通过就发送请求添加用户）
    addUser() {
      this.$refs.addFormRef.validate(async result => {
        if (!result) return;
        // 通过验证发送添加用户请求
        const { data: res } = await this.$http.post('users', this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error('用户添加失败');
        }
        this.$message.success('用户添加成功');
        // 添加成功后关闭添加用户列表+刷新用户列表
        this.dialogVisible = false;
        this.getUsersInfo();
      });
    },
    //@ 监听修改按钮点击事件
    async showEditDialogVisible(id) {
      // 根据id查询数据并展示
      const { data: res } = await this.$http.get(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error('修改的数据查询失败');
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //@ 监听修改提交按钮
    editUser() {
      this.$refs.editFormRef.validate(async result => {
        if (!result) return;
        // 通过验证发送添加用户请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('用户修改失败');
        }
        // 提示成功
        this.$message.success('用户修改成功');
        // 添加成功后关闭添加用户列表+刷新用户列表
        this.editDialogVisible = false;
        // 刷新用户列表
        this.getUsersInfo();
      });
    },
    //@ 监听删除用户按钮
    async deleteUser(id) {
      // 弹出确认框(返回值为promise对象，所以用async，await)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      // 如果确认删除，返回字符串，confirm；否则返回cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除');
      }
      // 根据id删除用户
      const { data: res } = await this.$http.delete('users/' + id);
      if (res.meta.status !== 200) {
        return this.$message.info('删除用户失败');
      }
      this.$message.success('用户删除成功');
      // 刷新用户列表
      this.getUsersInfo();
    },
    //@ 监听分配角色按钮
    async changeRole(thisUser) {
      // 展示弹出框之前查询角色列表展示
      this.thisUser = thisUser;
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败');
      }
      this.roleList = res.data;
      this.dialogVisibleRole = true;
    },
    //@ 监听角色改变事件(admin允许配修改，修改时会报错)
    async saveRole() {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色');
      }
      const { data: res } = await this.$http.put(
        `users/${this.thisUser.id}/role`,
        {
          rid: this.selectRoleId
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error('角色修改失败');
      }
      // 修改成功后（提示，关闭弹出框，刷新用户列表）
      this.$message.success('角色分配成功');
      this.dialogVisibleRole = false;
      this.getUsersInfo();
    },
    //@ 监听分配角色对话框的关闭事件(关闭后重置数据)
    dialogVisibleRoleClosed() {
      this.selectRoleId = '';
      this.thisUser = {};
    }
  }
};
</script>

<style lang="less" scoped>
</style>